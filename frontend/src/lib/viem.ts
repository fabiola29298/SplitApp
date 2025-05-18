// lib/viem.ts
import {
    createPublicClient,
    createWalletClient,
    Address,
    http,
    custom,
    type PublicClient,
    type WalletClient,
    type Account,
    type Chain, 
    type EIP1193Provider // El tipo de proveedor que Privy suele exponer
} from 'viem';

// --- Definición de la Cadena (Mantle Sepolia como ejemplo) ---
// !! VERIFICA ESTOS VALORES CON LA DOCUMENTACIÓN OFICIAL DE MANTLE !!
export const mantleSepoliaChainDefinition: Chain = {
    id: 5003,
    name: 'Mantle Sepolia Testnet',
    nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.mantle.xyz'] },
        public: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.mantle.xyz'] }
    },
    blockExplorers: { default: { name: 'Mantle Sepolia Explorer', url: 'https://explorer.sepolia.mantle.xyz' } },
    testnet: true,
};
const currentViemChain: Chain = mantleSepoliaChainDefinition;
const rpcUrl = currentViemChain.rpcUrls.default.http[0];

// --- Public Client (para lecturas, puede usar HTTP RPC directamente) ---
export const publicClient: PublicClient = createPublicClient({
  chain: currentViemChain,
  transport: http(rpcUrl),
});

/**
 * Crea un WalletClient de Viem usando el proveedor EIP-1193 y la cuenta de Privy.
 * Esta función se llamaría desde un contexto donde el proveedor de Privy y la cuenta estén disponibles.
 * @param privyProvider El proveedor EIP-1193 obtenido de Privy.
 * @param privyAccountAddress La dirección de la cuenta conectada a través de Privy.
 * @returns Una instancia de WalletClient configurada.
 * @throws Error si el proveedor o la cuenta no son válidos.
 */
export function createViemWalletClientFromPrivy(
    privyProvider: EIP1193Provider,
    privyAccountAddress: Address
): WalletClient & { account: Account; chain: Chain } {
    if (!privyProvider) {
        throw new Error("Privy provider is not available.");
    }
    if (!privyAccountAddress) {
        throw new Error("Privy account address is not available.");
    }

    const walletClient = createWalletClient({
        account: privyAccountAddress, // La cuenta de Privy
        chain: currentViemChain,     // La cadena que estamos usando
        transport: custom(privyProvider), // Usar el proveedor de Privy
    });

    return walletClient as WalletClient & { account: Account; chain: Chain };
}