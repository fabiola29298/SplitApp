// app/api/ask-nebula/route.ts
import { NextResponse } from 'next/server';
import { type Address as ViemAddress } from 'viem';

function messageImpliesTransaction(message: string): boolean {
    const keywords = ["send", "transfer", "pay", "deploy", "mint", "bridge", "swap"]; 
    const lowerCaseMessage = message.toLowerCase();
    return keywords.some(keyword => lowerCaseMessage.includes(keyword));
}
interface NebulaRequestBody {
    message: string; 
    execute_config?: NebulaExecuteConfig;
}
interface NebulaExecuteConfig {
    mode: "client";
    signer_wallet_address: ViemAddress;
}

export async function POST(request: Request) {
    console.log('[API /api/ask-nebula] POST handler started.');

    try {
        const { message, userWalletAddress } = await request.json();
        console.log('[API /api/ask-nebula] Received body:', { message, userWalletAddress });

        if (!message) { 
            console.log('[API /api/ask-nebula] Missing message.');
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const thirdwebSecretKey = process.env.NEXT_PUBLIC_THIRDWEB_KEY;
        if (!thirdwebSecretKey) {
            console.error("[API /api/ask-nebula] ERROR: THIRDWEB_SECRET_KEY is not set.");
            return NextResponse.json({ error: 'Server configuration error: Missing secret key' }, { status: 500 });
        }
        const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;


        let nebulaRequestBody: NebulaRequestBody = { 
            message: message 
        };

        
        if (messageImpliesTransaction(message)) {
            if (!userWalletAddress) {
                console.log('[API /api/ask-nebula] Transaction-like message but no userWalletAddress provided.');
                return NextResponse.json({ error: 'userWalletAddress is required for transaction-related messages' }, { status: 400 });
            }
            
            if (!/^0x[a-fA-F0-9]{40}$/.test(userWalletAddress)) {
                 console.log('[API /api/ask-nebula] Invalid userWalletAddress format.');
                return NextResponse.json({ error: 'Invalid userWalletAddress format' }, { status: 400 });
            }
             nebulaRequestBody = {  
                message: message,
                execute_config: {
                    mode: "client",
                    signer_wallet_address: userWalletAddress,
                    // chain_id: 5003, 
                }
            };
        }else {
            nebulaRequestBody = {  
                message: message, 
            };
        }
        
        console.log(`[API /api/ask-nebula] Calling Nebula API with body:`, JSON.stringify(nebulaRequestBody, null, 2));

        const nebulaApiResponse = await fetch("https://nebula-api.thirdweb.com/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-secret-key": thirdwebSecretKey,
                "x-client-id": clientId || "",
            },
            body: JSON.stringify(nebulaRequestBody),
        });
        
        console.log('[API /api/ask-nebula] Nebula API response status:', nebulaApiResponse.status);

        const responseBodyText = await nebulaApiResponse.text(); 
        
        if (!nebulaApiResponse.ok) {
            console.error("[API /api/ask-nebula] Nebula API Error Response Text:", responseBodyText);
             try {
                const errorJson = JSON.parse(responseBodyText);
                return NextResponse.json({ error: `Nebula API Error: ${errorJson.error?.message || responseBodyText}` }, { status: nebulaApiResponse.status });
            } catch {
                return NextResponse.json({ error: `Nebula API Error: ${responseBodyText}` }, { status: nebulaApiResponse.status });
            }
        }

        const nebulaData = JSON.parse(responseBodyText);  
        console.log("[API /api/ask-nebula] Nebula API Raw JSON Data:", JSON.stringify(nebulaData, null, 2));

         if (nebulaData.actions && nebulaData.actions.length > 0 && nebulaData.actions[0].type === "sign_transaction" && nebulaData.actions[0].data) {
            try {
                const actionDataString = nebulaData.actions[0].data;
                const transactionParams = JSON.parse(actionDataString); 
                
                return NextResponse.json({
                    transactionParams: transactionParams, 
                    explanation: nebulaData.message || nebulaData.actions[0].explanation || "Transaction ready to be signed.",
                });
            } catch (parseError) {
                console.error("[API /api/ask-nebula] Error parsing Nebula action data (JSON string):", parseError, "Data string was:", nebulaData.actions[0].data);
                return NextResponse.json({
                    error: "Failed to parse transaction data string from Nebula",
                    rawDataString: nebulaData.actions[0].data
                }, { status: 500 });
            }
        } else if (nebulaData.message) {  
            console.log("[API /api/ask-nebula] Nebula provided explanation only:", nebulaData.message);
            return NextResponse.json({ explanation: nebulaData.message });
        } else {
             console.log("[API /api/ask-nebula] Nebula response structure not fully recognized or no action/explanation.");
            return NextResponse.json({
                explanation: "Nebula processed the request, but the response format was not fully recognized or contained no specific action/explanation.",
                rawData: nebulaData,
            });
        }

    } catch (error: unknown) {
        // ... (Manejo de errores general como antes) ...
        console.error("[API /api/ask-nebula] General error in POST handler:", error);
        let errorMessage = "Unknown server error";
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
             errorMessage = "Invalid JSON in request body to this API route.";
             return NextResponse.json({ error: errorMessage }, { status: 400 });
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
