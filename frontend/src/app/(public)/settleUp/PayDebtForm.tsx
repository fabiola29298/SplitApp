// src/components/PayDebtForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle, Send, User, ChevronRight, ChevronLeft, LockKeyhole } from "lucide-react"; // Send icon for pay
import { payDebtToCreditor, type PayDebtArgs } from '@/lib/services/groupServices'; // Ajusta la ruta
import { publicClient, createViemWalletClientFromPrivy, mantleSepoliaChainDefinition } from '@/lib/viem';
import Link from "next/link";
import { useWallets, usePrivy } from '@privy-io/react-auth';
import {
    type WriteContractReturnType,
    type WalletClient,
    type Account,
    type Chain,
    type EIP1193Provider,
    type Address// Utilidad de Viem para validar direcciones
} from 'viem';

interface PayDebtFormProps {
    defaultGroupId?: string;
    defaultCreditor?: string;
    onDebtPaid?: (txHash: WriteContractReturnType) => void;
}

export default function PayDebtForm({ onDebtPaid }: PayDebtFormProps) {
 
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successTxHash, setSuccessTxHash] = useState<WriteContractReturnType | null>(null);

    const { wallets } = useWallets();
    const { ready, authenticated } = usePrivy();
    const activeWallet = wallets.find(wallet => wallet.walletClientType === "privy") || wallets[0];
    const [viemWalletClient, setViemWalletClient] = useState<(WalletClient & { account: Account; chain: Chain }) | null>(null);

    useEffect(() => {
        const setupViemClient = async () => {
            if (ready && authenticated && activeWallet && activeWallet.address) {
                try {
                    const provider = await activeWallet.getEthereumProvider();
                    const client = createViemWalletClientFromPrivy(
                        provider as EIP1193Provider,
                        activeWallet.address as Address
                    );
                    setViemWalletClient(client);
                } catch (err) {
                    console.error("Failed to setup Viem Wallet Client for PayDebtForm:", err);
                    setError("Failed to initialize wallet.");
                }
            } else {
                setViemWalletClient(null);
            }
        };
        setupViemClient();
    }, [ready, authenticated, activeWallet]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessTxHash(null);

        if (!viemWalletClient) {
            setError("Wallet not connected or initialized.");
            setIsLoading(false);
            return;
        }
 

        const payDebtArgs: PayDebtArgs = {
            groupId: BigInt(1),
            creditorAddress: `0x${"8F85B6eC0C671B39871c03ACe99712b9e403204B"}`, // Cast a Address después de la validación
            amountToPayInEther: "0.1",
        };

        try {
            const txHash = await payDebtToCreditor(viemWalletClient, payDebtArgs);
            setSuccessTxHash(txHash);

            const transactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
            console.log("Pay Debt Transaction Confirmed:", transactionReceipt);

            if (transactionReceipt.status === 'success') {
                setError(null);
                // Resetear campos o dejar que el usuario decida
                // setGroupId(defaultGroupId || '');
                // setCreditorAddress(defaultCreditor || '');
                // setAmount('');
                if (onDebtPaid) onDebtPaid(txHash);
            } else {
                setError("Transaction failed on-chain. Status: " + transactionReceipt.status);
            }

        } catch (e: unknown) {
            let errorMessage = "Failed to pay debt.";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            console.error("Pay debt error in form:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-[#12131A] border border-solid border-[#273345] rounded-[24px] text-white">
            <CardHeader>
                <div className="justify-start">
                    <Link href={"/dashboard"}>
                    <div className="rounded-[6px] flex items-center justify-center">
                                <ChevronLeft className="w-5 h-5" />
                                <p className="text-xs">Back</p>
                            </div>
                        </Link>
                </div>
                <div>
                    <CardTitle className="text-xl">
                    
                        Pay Debt</CardTitle>
                    <CardDescription>Settle your dues with a group member.</CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name" className="text-[16px] text-white pb-4">
                        <span className="text-gray-500">With  </span>
                        <span className="text-white"> you  </span>
                        <span className="text-gray-500"> and: </span>
                        Cousin Crew</Label>
                        <div className="flex"> 
                            <div className="w-12 h-12 p-3 bg-[#4B5563] rounded-full ">
                             <User/>
                            </div>
                            <div className="p-3  ">
                             <ChevronRight/>
                            </div>
                            <div className="w-12 h-12 p-3 bg-[#4B5563] rounded-full ">
                             <User/>
                            </div>

                         </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="payDebtGroupId" className="text-sm">Group Name</Label>
                        <div className="flex items-center  ">
                            <div className="min-w-2/3 bg-[#191D26] border-[#273345] focus:ring-[#7A8A99] p-2 border-2 rounded-md flex">
                                <p  className="p-2 text-xs">
                                    Cousin Crew 
                                </p>
                            </div>
                            <LockKeyhole className="ml-4 mt-1"/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="creditorAddress" className="text-sm">Creditor&apos;s Address</Label>
                        <div className="flex items-center  ">
                            <div className="min-w-2/3 bg-[#191D26] border-[#273345] focus:ring-[#7A8A99] p-2 border-2 rounded-md flex">
                                <p  className="p-2 text-xs">
                                    0x7496E003D30D861A8922AFfDDd98Ca0FF2a04A5a 
                                </p>
                            </div>
                            <LockKeyhole className="ml-4 mt-1"/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="payDebtAmount" className="text-sm">Description</Label>
                        <div className="flex items-center  ">
                            <div className="min-w-2/3 bg-[#191D26] border-[#273345] focus:ring-[#7A8A99] p-2 border-2 rounded-md flex">
                                <p  className="p-2">
                                    Taxi 
                                </p>
                            </div>
                            <LockKeyhole className="ml-4 mt-1"/>
                        </div>
                        
                        
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="payDebtAmount" className="text-sm">Amount ($MNT)</Label>
                        <div className="flex items-center  ">
                            <div className="min-w-2/3 bg-[#191D26] border-[#273345] focus:ring-[#7A8A99] p-2 border-2 rounded-md flex">
                                <p  className="p-2">
                                    10 
                                </p>
                            </div>
                            <LockKeyhole className="ml-4 mt-1"/>
                        </div>
                        
                        
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch p-5">
                    {error && ( <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-md text-sm flex items-center"> <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error} </div> )}
                    {successTxHash && !error && ( <div className="mb-4 p-3 bg-green-900/30 border border-green-700 text-green-300 rounded-md text-sm flex items-center"> <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" /> Payment sent! Tx: <a href={`${mantleSepoliaChainDefinition.blockExplorers?.default.url}/tx/${successTxHash}`} target="_blank" rel="noopener noreferrer" className="underline ml-1 truncate hover:text-green-100">{successTxHash.substring(0,10)}...</a> {isLoading && <span className="ml-2 text-xs">(Confirming...)</span>} </div> )}
                    <Button type="submit" className="w-full bg-[#FF6600] hover:bg-[#E65C00] text-white font-semibold" disabled={isLoading || !ready || !authenticated || !viemWalletClient}>
                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Pay Debt</>}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}