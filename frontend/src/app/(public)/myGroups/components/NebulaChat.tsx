"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, UserCircle, Loader2, AlertTriangle } from "lucide-react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
    createViemWalletClientFromPrivy, // Asumiendo que está en lib/viem y toma (privyProvider, privyAccountAddress)
    publicClient   // Tu definición de cadena de lib/viem
} from '@/lib/viem';                  // Ajusta la ruta si es necesario

import { 
    type EIP1193Provider, // Tipo para el proveedor que Privy debería exponer
    type Hex,
    type Address as ViemAddress // Renombrado para claridad si tienes otro 'Address'
} from 'viem';

// Interfaz para los mensajes del chat
interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'nebula' | 'system';
    isLoading?: boolean;
}

// Interfaz para los parámetros de transacción esperados de Nebula (vía tu backend)
export interface NebulaTransactionParams {
    to: ViemAddress;
    data: Hex;
    value: string; // Nebula probablemente devuelve value como string, Viem lo necesita como bigint
    chainId: number; // o string
    // Podría haber otros campos como gasLimit, etc.
}

// Función para llamar a tu backend que llama a Nebula
async function askNebulaViaBackend(
    message: string,
    userAddress?: ViemAddress
): Promise<{
    explanation?: string;
    transactionParams?: NebulaTransactionParams;
    rawData?: unknown; // Para datos crudos si necesitas depurar
    error?: string;
}> {
    try {
        const response = await fetch("/api/ask-nebula", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, userWalletAddress: userAddress }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Nebula backend request failed: ${response.statusText}` }));
            throw new Error(errorData.error || `Nebula backend request failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling backend for Nebula:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error communicating with backend.";
        return { error: errorMessage };
    }
}


export default function NebulaChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'init-nebula', text: "Hello! I'm Nebula, your on-chain assistant. How can I help you?", sender: 'nebula' }
    ]);
    const [inputValue, setInputValue] = useState<string>('');
    const [isNebulaTyping, setIsNebulaTyping] = useState<boolean>(false);
    //const [setCurrentError] = useState<string | null>(null); // Para errores generales del chat

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { user, ready, authenticated, login } = usePrivy();
    const { wallets } = useWallets();
    const activeWallet = wallets.find(wallet => wallet.walletClientType === "privy") || wallets[0]; // Lógica simple para seleccionar wallet

    // Auto-scroll
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSystemMessage = (text: string, type: 'error' | 'info' = 'info') => {
        setMessages(prev => [...prev, {
            id: Date.now().toString() + '-system',
            text: text,
            sender: type === 'error' ? 'system' : 'nebula', // Usar 'nebula' para info, 'system' para error visual
            isLoading: false
        }]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userMessageText = inputValue.trim();
        if (!userMessageText || isNebulaTyping) return;
 
        const userMessage: ChatMessage = {
            id: Date.now().toString() + '-user',
            text: userMessageText,
            sender: 'user',
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsNebulaTyping(true);

        const nebulaResponseId = Date.now().toString() + '-nebula-response';
        const nebulaTypingMessage: ChatMessage = {
            id: nebulaResponseId,
            text: '',
            sender: 'nebula',
            isLoading: true,
        };
        setMessages(prev => [...prev, nebulaTypingMessage]);

        try {
            if (!ready || !authenticated || !user?.wallet?.address) {
                handleSystemMessage("Please connect your Privy wallet first to interact fully.", "error");
                // Opcionalmente, intentar login:
                // if (!authenticated) login(); 
                setMessages(prev => prev.filter(msg => msg.id !== nebulaResponseId)); // Remover mensaje de "pensando"
                setIsNebulaTyping(false);
                return;
            }
            const userWalletAddress = user.wallet.address as ViemAddress;

            const nebulaResponse = await askNebulaViaBackend(userMessageText, userWalletAddress);

            if (nebulaResponse.error) {
                throw new Error(nebulaResponse.error);
            }

            const nebulaResponseText = nebulaResponse.explanation || "Nebula processed your request.";

            // Actualizar el mensaje de "pensando" con la respuesta de Nebula
            setMessages(prev => prev.map(msg =>
                msg.id === nebulaResponseId
                ? { ...msg, text: nebulaResponseText, isLoading: false }
                : msg
            ));

            if (nebulaResponse.transactionParams) {
                handleSystemMessage("Nebula has prepared a transaction. Please review and confirm in your wallet if prompted.");

                // ¡Confirmación del Usuario antes de enviar! (MUY IMPORTANTE)
                // En una app real, tendrías un UI más sofisticado para esto.
                // Usaremos window.confirm por simplicidad para la hackathon.
                const userConfirmation = window.confirm(
                    `${nebulaResponseText}\n\nNebula proposes the following transaction:\n` +
                    `To: ${nebulaResponse.transactionParams.to}\n` +
                    `Value: ${BigInt(nebulaResponse.transactionParams.value).toString()} wei\n` + // Mostrar en wei o convertir a MNT
                    `Data: ${nebulaResponse.transactionParams.data.substring(0, 30)}...\n` +
                    `Chain ID: ${nebulaResponse.transactionParams.chainId}\n\n` +
                    `Do you want to proceed and sign this transaction with your Privy wallet?`
                );

                if (userConfirmation && activeWallet) { // activeWallet debería estar definido si user.wallet existe
                    setIsNebulaTyping(true); // Indicar que estamos procesando la tx
                    handleSystemMessage("Preparing transaction with your wallet...");
                    try {
                        // NECESITAS VERIFICAR ESTA LÍNEA CON PRIVY:
                        const privyProvider = await activeWallet.getEthereumProvider(); // O el método correcto de Privy

                        if (!privyProvider) {
                            throw new Error("Could not get Ethereum provider from Privy wallet.");
                        }

                        const viemWalletClient = createViemWalletClientFromPrivy(
                            privyProvider as EIP1193Provider,
                            userWalletAddress
                        );

                        const txParams = nebulaResponse.transactionParams;

                        if (viemWalletClient.chain.id !== Number(txParams.chainId)) {
                            throw new Error(
                                `Network mismatch: Transaction is for chain ${txParams.chainId}, but your wallet is on chain ${viemWalletClient.chain.id}. Please switch networks in your Privy wallet or ensure Nebula is targeting the correct chain.`
                            );
                        }
                        
                        handleSystemMessage(`Sending transaction... (To: ${txParams.to}, Value: ${BigInt(txParams.value).toString()} wei)`);

                        const hash = await viemWalletClient.sendTransaction({
                            account: viemWalletClient.account,
                            to: txParams.to,
                            data: txParams.data,
                            value: BigInt(txParams.value),
                            chain: viemWalletClient.chain // Opcional pero puede ser más explícito
                        });

                        handleSystemMessage(`Transaction sent! Hash: ${hash}. Waiting for confirmation...`);
                        await publicClient.waitForTransactionReceipt({ hash });
                        handleSystemMessage(`Transaction ${hash.substring(0,10)}... confirmed!`);

                    } catch (txError: unknown) {
                        const txErrorMessage = txError instanceof Error ? txError.message : "Transaction failed during signing or sending.";
                        console.error("Transaction execution error via Nebula:", txError);
                        handleSystemMessage(`Transaction Error: ${txErrorMessage}`, 'error');
                    } finally {
                        setIsNebulaTyping(false);
                    }
                } else {
                    handleSystemMessage("Transaction cancelled by user or wallet not ready.", 'info');
                }
            }
        } catch (error) { // Error de askNebulaViaBackend o de la lógica del chat
            console.error("Error in handleSubmit after Nebula API call:", error);
            const errorMessageText = error instanceof Error ? error.message : "Sorry, an unexpected error occurred with Nebula.";
            setMessages(prev => prev.map(msg =>
                msg.id === nebulaResponseId
                ? { ...msg, text: errorMessageText, sender: 'system', isLoading: false }
                : msg
            ));
           // setCurrentError(errorMessageText); // Podrías mostrar este error fuera del log de chat también
        } finally {
            if (messages.find(m => m.id === nebulaResponseId && m.isLoading)) { // Si el mensaje de carga sigue ahí y no se actualizó
                setMessages(prev => prev.map(msg =>
                    msg.id === nebulaResponseId
                    ? { ...msg, text: "Failed to get a response from Nebula.", sender: 'system', isLoading: false }
                    : msg
                ));
            }
            setIsNebulaTyping(false);
            inputRef.current?.focus();
        }
    };
    

    return (
        <Card className="w-full max-w-2xl mx-auto h-[calc(100vh-150px)] min-h-[400px] flex flex-col bg-[#12131A] border border-solid border-[#273345] rounded-[24px] text-white shadow-2xl">
            <CardHeader className="p-4 border-b border-[#273345]">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="w-6 h-6 text-[#00C875]" />
                    Chat with Nebula AI
                </CardTitle>
                 {(!ready || !authenticated) && <p className="text-xs text-yellow-400">Privy loading or not authenticated. <Button variant="link" size="sm" onClick={login} className="p-0 h-auto text-yellow-300 hover:text-yellow-200">Login with Privy</Button></p>}
            </CardHeader>

            <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 mb-3 ${ // Added mb-3
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {msg.sender !== 'user' && (
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-black ${
                                msg.sender === 'nebula' ? 'bg-[#00C875]' : 
                                msg.sender === 'system' ? 'bg-red-600' : 'bg-blue-500' // System might be info too
                            }`}>
                                {msg.sender === 'nebula' ? <Bot size={20} /> : 
                                 msg.sender === 'system' ? <AlertTriangle size={20} className="text-white"/> : <UserCircle size={20} />
                                }
                            </div>
                        )}
                        <div
                            className={`max-w-[75%] px-3 py-2 rounded-lg shadow-md text-sm ${ // Adjusted padding and max-width
                                msg.sender === 'user'
                                    ? 'bg-[#007AFF] text-white rounded-br-none'
                                    : msg.sender === 'nebula'
                                    ? 'bg-[#2C2C2E] text-gray-200 rounded-bl-none'
                                    : 'bg-red-800 text-red-100 rounded-bl-none' // System error
                            }`}
                        >
                            {msg.isLoading ? (
                                <div className="flex items-center space-x-2 opacity-75">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Nebula is thinking...</span>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            )}
                        </div>
                        {msg.sender === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <UserCircle size={20} className="text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>

            <div className="p-4 border-t border-[#273345] bg-[#191D26]">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={!ready || !authenticated ? "Connect Privy wallet to chat..." : "Ask Nebula to do something on-chain..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-grow bg-[#2C2C2E] border-[#3A3A3C] focus:ring-[#007AFF] focus:border-[#007AFF] text-sm rounded-lg"
                        disabled={isNebulaTyping || !ready || !authenticated}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        className="bg-[#007AFF] hover:bg-[#0056b3] text-white rounded-lg px-4 py-2"
                        disabled={isNebulaTyping || !inputValue.trim() || !ready || !authenticated}
                        size="icon"
                    >
                        {isNebulaTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
                 <p className="text-xs text-gray-500 mt-2 text-center px-2">
                    test
                </p>
            </div>
        </Card>
    );
}