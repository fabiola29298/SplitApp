// src/components/AddExpenseForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle, ChevronLeft, LockKeyhole  } from "lucide-react";
import Link from 'next/link';
import { addExpenseToGroup, type AddExpenseArgs } from '@/lib/services/groupServices';
import { publicClient, createViemWalletClientFromPrivy, mantleSepoliaChainDefinition } from '@/lib/viem'; // Importa lo necesario de tu lib/viem
import { useWallets, usePrivy } from '@privy-io/react-auth'; // Hooks de Privy
import {
    type WriteContractReturnType,
    type WalletClient,
    type Account,
    type Chain,
    type EIP1193Provider,
    type Address
} from 'viem';

interface AddExpenseFormProps {
    defaultGroupId?: string;
    onExpenseAdded?: (txHash: WriteContractReturnType) => void;
}

export default function AddExpenseForm({ onExpenseAdded }: AddExpenseFormProps) {
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successTxHash, setSuccessTxHash] = useState<WriteContractReturnType | null>(null);

    const { wallets } = useWallets(); // Hook de Privy para obtener las wallets conectadas
    const { ready, authenticated } = usePrivy(); // Hooks para el estado de Privy

    // Elige la wallet embebida o la primera wallet conectada
    // Ajusta esta lógica según cómo quieras que el usuario seleccione la wallet si tiene múltiples
    const activeWallet = wallets.find(wallet => wallet.walletClientType === "privy") || wallets[0];

    const [viemWalletClient, setViemWalletClient] = useState<(WalletClient & { account: Account; chain: Chain }) | null>(null);

    useEffect(() => {
        const setupViemClient = async () => {
            if (ready && authenticated && activeWallet && activeWallet.address) {
                try {
                    // Obtener el proveedor EIP-1193 de la wallet de Privy
                    const provider = await activeWallet.getEthereumProvider(); // o getEthersProvider() y adaptarlo si es necesario
                    const client = createViemWalletClientFromPrivy(
                        provider as EIP1193Provider, // Privy debería exponer un EIP1193Provider
                        activeWallet.address as Address
                    );
                    setViemWalletClient(client);
                } catch (err) {
                    console.error("Failed to setup Viem Wallet Client with Privy provider:", err);
                    setError("Failed to initialize wallet. Please try reconnecting.");
                }
            } else {
                setViemWalletClient(null); // Reset si no hay wallet activa
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
            setError("Wallet not connected or initialized. Please connect your Privy wallet.");
            setIsLoading(false);
            return;
        }

        if ( !amount || !description) {
            setError("All fields are required.");
            setIsLoading(false);
            return;
        }

        const expenseArgs: AddExpenseArgs = {
            groupId: BigInt("0x8F85B6eC0C671B39871c03ACe99712b9e403204B"),
            totalAmountInEther: amount,
            description,
        };

        try {
            // Pasar la instancia del viemWalletClient (creada con el proveedor de Privy)
            const txHash = await addExpenseToGroup(viemWalletClient, expenseArgs);
            setSuccessTxHash(txHash);

            // Esperar confirmación (usando el publicClient global de Viem)
            const transactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
            console.log("Transaction Confirmed:", transactionReceipt);
            
            if (transactionReceipt.status === 'success') {
                setError(null);
                setAmount('');
                setDescription('');
                if (onExpenseAdded) onExpenseAdded(txHash);
            } else {
                setError("Transaction failed on-chain. Status: " + transactionReceipt.status);
            }

        } catch (e: unknown) {
            let errorMessage = "Failed to add expense.";
            if (e instanceof Error) errorMessage = e.message;
            setError(errorMessage);
            console.error("Add expense error in form:", e);
        } finally {
            setIsLoading(false);
        }
    };

    // El JSX del formulario puede ser el mismo que en el ejemplo anterior
    // Solo asegúrate de que el botón de submit esté deshabilitado si !ready || !authenticated || !viemWalletClient
    return (
        <Card className="w-full max-w-md mx-auto bg-[#12131A] border border-solid border-[#273345] rounded-[24px] text-white">
            <CardHeader>
                <Link href={"/dashboard"}>
                <ChevronLeft className="w-5 h-5" />
                Back
                </Link>
                <CardTitle className="text-xl">Add New Expense</CardTitle>
                <CardDescription>Ensure your wallet is connected on the Mantle Sepolia network.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {/* ... (Inputs para groupId, amount, description como antes) ... */}
                    <div className="space-y-1">  
                        <Label htmlFor="name" className="text-[16px] text-white pb-4">
                        <span className="text-gray-500">With  </span>
                        <span className="text-white"> you  </span>
                        <span className="text-gray-500"> and: </span>
                        Cousin Crew (3 members)</Label>
                       
                     </div>
                    <div className="space-y-1">
                        <Label htmlFor="amount" className="text-sm">Total Amount (e.g., in MNT)</Label>
                        <Input id="amount" type="text" placeholder="e.g., 0.5" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-[#191D26] border-[#273345] focus:ring-[#7A8A99]" disabled={isLoading || !viemWalletClient} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="description" className="text-sm">Description</Label>
                        <Textarea id="description" placeholder="e.g., Groceries, Rent" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[#191D26] border-[#273345] focus:ring-[#7A8A99] min-h-[80px]" disabled={isLoading || !viemWalletClient} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="wallet" className="text-xs text-[#9CA3AF]">Paid by</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a way to paid" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Select a way to paid</SelectLabel>
                              <SelectItem value="by-equally">Paid by you and split equally</SelectItem>
                              <SelectItem value="by-exact-amount" disabled >Split by exact amount (coming soon in the next version) <LockKeyhole/> </SelectItem>
                              <SelectItem value="by-percentages" disabled >Split by percentages (coming soon in the next version) <LockKeyhole/>  </SelectItem> 
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                    </div>
                    <div className="space-y-1 pb-5">
                        <p className="text-xs text-[#9CA3AF]"> Balance</p>
                        <p className="text-xl"> $MNT ${Math.round(parseFloat(amount)/3)} / person</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch">
                    {/* ... (Mensajes de error y éxito como antes) ... */}
                     {error && ( <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-md text-sm flex items-center"> <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error} </div> )}
                    {successTxHash && !error && ( <div className="mb-4 p-3 bg-green-900/30 border border-green-700 text-green-300 rounded-md text-sm flex items-center"> <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" /> Expense submitted! Tx: <a href={`${mantleSepoliaChainDefinition.blockExplorers?.default.url}/tx/${successTxHash}`} target="_blank" rel="noopener noreferrer" className="underline ml-1 truncate hover:text-green-100">{successTxHash.substring(0,10)}...</a> {isLoading && <span className="ml-2 text-xs">(Waiting for confirmation...)</span>} </div> )}
                    <Button type="submit" className="w-full bg-[#00C875] hover:bg-[#00A360] text-black font-semibold" disabled={isLoading || !ready || !authenticated || !viemWalletClient}>
                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Add Expense"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}