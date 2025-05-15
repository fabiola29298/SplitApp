//lib/viem.ts
import { createPublicClient, createWalletClient, http,custom} from 'viem';
import { mantleSepoliaTestnet } from 'viem/chains';


export const publicClient = createPublicClient({
  chain: mantleSepoliaTestnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL)
});


export async function getWalletClient() {
  if (!window.ethereum) throw new Error('No ethereum provider found');

  const walletClient = createWalletClient({
    chain: mantleSepoliaTestnet,
    transport: custom(window.ethereum)
  });

  const [address] = await walletClient.getAddresses();

  return { walletClient, address };
}


