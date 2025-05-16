import {
  createPublicClient,
  http,
  createWalletClient,
  parseGwei, // Útil para fallbacks, pero las estimaciones vienen en wei
  formatEther,
  Address,
  Hex,
  TransactionExecutionError, // Para capturar errores específicos si es necesario
} from "viem";
import {  mantleSepoliaTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
 
import * as dotenv from "dotenv";
dotenv.config();

// Asegúrate de que esta ruta es correcta después de compilar
import { abi as splitterAbi, bytecode as splitterBytecode } from "../artifacts/contracts/Splitter.sol/Splitter.json";

const providerApiKey = process.env.NEXT_PUBLIC_RPC_PROVIDER || "";
const deployerPrivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";

async function main() {
  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http(providerApiKey)
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);

  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const deployer = createWalletClient({
    account,
    chain: mantleSepoliaTestnet,
    transport: http(providerApiKey)
  });
  console.log("Deployer address:", deployer.account.address);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );// El constructor de Splitter es: constructor() Ownable(msg.sender) {} -> no toma argumentos
  const constructorArgsForSplitter: any[] = []; 
   
  console.log("Deployando el contrato");
  const hash = await deployer.deployContract({
    abi: splitterAbi,
    bytecode: splitterBytecode as Hex,
    account: deployer.account,
    args: constructorArgsForSplitter, 
  });
  console.log("Transaction hash:", hash);
  console.log("Esperando confirmaciones...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Contrato desplegado en:", receipt.contractAddress);
 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
