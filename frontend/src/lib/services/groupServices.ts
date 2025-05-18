// src/services/groupService.ts
import { publicClient } from '@/lib/viem'; // Importa la nueva función
import {
    CONTRACT_ABI as FULL_CONTRACT_ABI,
    CONTRACT_ADDRESS as RAW_CONTRACT_ADDRESS,
} from '@/lib/contract';
import {
    type Address,
    type Abi,
    parseEther,
    type WriteContractReturnType,
    type WalletClient, // Tipo para el walletClient
    type Account,      // Tipo para la cuenta
    type Chain,        // Tipo para la cadena 
} from 'viem';
import { BaseError as ViemBaseError, TransactionExecutionError, UserRejectedRequestError, SwitchChainError } from 'viem';

const CONTRACT_ADDRESS: Address = RAW_CONTRACT_ADDRESS as Address;
const CONTRACT_ABI = FULL_CONTRACT_ABI as Abi;

export interface AddExpenseArgs {
    groupId: bigint;
    totalAmountInEther: string;
    description: string;
}

/**
 * Añade un gasto al grupo usando un WalletClient de Viem (que puede ser creado con un proveedor de Privy).
 * @param walletClientInstance El WalletClient de Viem ya configurado con la cuenta y el proveedor de Privy.
 * @param args Los argumentos para añadir el gasto.
 * @returns El hash de la transacción.
 */
export async function addExpenseToGroup(
    walletClientInstance: WalletClient & { account: Account; chain: Chain }, // Recibe el cliente de Privy/Viem
    args: AddExpenseArgs
): Promise<WriteContractReturnType> {
    if (!walletClientInstance || !walletClientInstance.account) {
        throw new Error("Wallet client with an account is required.");
    }
    const account = walletClientInstance.account;
    const { groupId, totalAmountInEther, description } = args;
    const totalAmountInWei = parseEther(totalAmountInEther);

    try {
        const { request } = await publicClient.simulateContract({
            account,
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'addExpense',
            args: [groupId, totalAmountInWei, description],
        });

        const hash = await walletClientInstance.writeContract(request);
        return hash;

    } catch (error: unknown) {
        console.error("Error in addExpenseToGroup service:", error);
        // ... (tu manejo de errores mejorado, como en el ejemplo anterior)
        if (error instanceof UserRejectedRequestError) throw new Error(`Transaction rejected by user: ${error.shortMessage}`);
        if (error instanceof TransactionExecutionError) {
            const causeMessage = error.cause instanceof Error ? error.cause.message : "Details not available.";
            throw new Error(`Transaction failed: ${error.shortMessage}. Reason: ${causeMessage}`);
        }
        if (error instanceof SwitchChainError) throw new Error("Incorrect network. Please switch in your wallet.");
        if (error instanceof ViemBaseError) throw new Error(`Blockchain error: ${error.shortMessage || error.message}`);
        if (error instanceof Error) throw new Error(`Failed to add expense: ${error.message}`);
        throw new Error('An unknown error occurred while adding the expense.');
    }
}