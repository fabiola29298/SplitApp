"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Para el historial de chat
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, UserCircle, Loader2, AlertTriangle } from "lucide-react"; 
import { usePrivy } from '@privy-io/react-auth'; // Para obtener la dirección del usuario si es necesario

// Interfaz para los mensajes del chat
interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'nebula' | 'system'; // 'system' para mensajes de error o info
    isLoading?: boolean; // Para mostrar un loader en la respuesta de Nebula
}

// --- SIMULACIÓN DE LA API DE NEBULA ---
// En un proyecto real, esto estaría en un archivo de servicio y haría una llamada real.
// Para la hackathon, puedes empezar con esto y luego intentar conectarlo.
async function askNebulaApi(message: string, userAddress?: string): Promise<string> {
    console.log("Sending to Nebula API:", message, "User Address:", userAddress);
    // Simular un delay de la API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Lógica de simulación de respuesta (¡REEMPLAZA ESTO CON LA LLAMADA REAL!)
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
        return "Hello! I am Nebula, your blockchain assistant. How can I help you today?";
    } else if (message.toLowerCase().includes("gas price on mantle")) {
        return `The current gas price on Mantle is approximately ${Math.floor(Math.random() * 10) + 1} Gwei. (Simulated)`;
    } else if (message.toLowerCase().includes("my wallet address")) {
        return userAddress ? `Your connected wallet address is: ${userAddress} (Simulated)` : "I can't see your wallet address unless you're connected and you ask me to use it.";
    } else if (message.toLowerCase().includes("deploy a token")) {
        return "Okay, to deploy an ERC20 token, I need a name, symbol, and initial supply. For example: 'Deploy ERC20 Token: MyToken (MTK) with 1,000,000 supply on Mantle Sepolia.' (Simulated)";
    } else if (message.toLowerCase().match(/pay ([\d.]+) MNT to (0x[a-fA-F0-9]{40}) for group (\d+)/i)) {
        const match = message.match(/pay ([\d.]+) MNT to (0x[a-fA-F0-9]{40}) for group (\d+)/i);
        if (match) {
            return `Understood! I can help prepare a transaction to pay ${match[1]} MNT to ${match[2]} for group ${match[3]}. Please confirm, and I'll generate the transaction parameters for you to sign with your wallet. (Simulated - In a real app, this would then interact with your Viem/Privy setup).`;
        }
    }
    return "I'm still learning! I couldn't process that request. Try asking about gas prices, deploying contracts, or simple transfers. (Simulated)";
}
// --- FIN DE SIMULACIÓN DE API ---


export default function NebulaChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'init', text: "Hello! I'm Nebula. Ask me anything about blockchain or tell me what you want to do on-chain.", sender: 'nebula' }
    ]);
    const [inputValue, setInputValue] = useState<string>('');
    const [isNebulaTyping, setIsNebulaTyping] = useState<boolean>(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { user, ready, authenticated } = usePrivy(); // Obtener la dirección del usuario de Privy

    // Auto-scroll al final del chat
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userMessageText = inputValue.trim();
        if (!userMessageText) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString() + '-user',
            text: userMessageText,
            sender: 'user',
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsNebulaTyping(true);

        // Placeholder para la respuesta de Nebula
        const nebulaResponseId = Date.now().toString() + '-nebula';
        const nebulaTypingMessage: ChatMessage = {
            id: nebulaResponseId,
            text: '', // Vacío mientras carga
            sender: 'nebula',
            isLoading: true,
        };
        setMessages(prev => [...prev, nebulaTypingMessage]);

        try {
            // Si necesitas la dirección del usuario para la query a Nebula:
            const userWalletAddress = ready && authenticated && user?.wallet?.address ? user.wallet.address : undefined;
            
            const nebulaResponseText = await askNebulaApi(userMessageText, userWalletAddress);
            
            setMessages(prev => prev.map(msg => 
                msg.id === nebulaResponseId 
                ? { ...msg, text: nebulaResponseText, isLoading: false } 
                : msg
            ));
        } catch (error) {
            console.error("Error asking Nebula:", error);
            const errorMessageText = error instanceof Error ? error.message : "Sorry, something went wrong while contacting Nebula.";
            setMessages(prev => prev.map(msg => 
                msg.id === nebulaResponseId 
                ? { ...msg, text: errorMessageText, sender: 'system', isLoading: false } 
                : msg
            ));
        } finally {
            setIsNebulaTyping(false);
            inputRef.current?.focus();
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto h-[70vh] flex flex-col bg-[#12131A] border border-solid border-[#273345] rounded-[24px] text-white shadow-2xl">
            <CardHeader className="p-4 border-b border-[#273345]">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="w-6 h-6 text-[#00C875]" />
                    Chat with Nebula AI
                </CardTitle>
            </CardHeader>

            <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {msg.sender !== 'user' && (
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'nebula' ? 'bg-[#00C875]' : 'bg-red-500'}`}>
                                {msg.sender === 'nebula' ? <Bot size={20} className="text-black" /> : <AlertTriangle size={20} className="text-white" />}
                            </div>
                        )}
                        <div
                            className={`max-w-[70%] px-4 py-2 rounded-xl shadow ${
                                msg.sender === 'user'
                                    ? 'bg-[#007AFF] text-white rounded-br-none' // Estilo burbuja de usuario
                                    : msg.sender === 'nebula'
                                    ? 'bg-[#2C2C2E] text-gray-200 rounded-bl-none' // Estilo burbuja de Nebula
                                    : 'bg-red-800 text-red-100 rounded-bl-none' // Estilo burbuja de error del sistema
                            }`}
                        >
                            {msg.isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Nebula is thinking...</span>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            )}
                        </div>
                        {msg.sender === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                <UserCircle size={20} className="text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>

            <div className="p-4 border-t border-[#273345]">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask Nebula to do something on-chain..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-grow bg-[#191D26] border-[#273345] focus:ring-[#7A8A99] text-sm"
                        disabled={isNebulaTyping}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        className="bg-[#007AFF] hover:bg-[#0056b3] text-white"
                        disabled={isNebulaTyping || !inputValue.trim()}
                    >
                        {isNebulaTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
                 <p className="text-xs text-gray-500 mt-2 text-center">
                    Example: Pay 0.1 MNT to 0x... for group 0 or Whats the gas price on Mantle?
                </p>
            </div>
        </Card>
    );
}