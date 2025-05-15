import hre from "hardhat"; // Hardhat Runtime Environment for verification
import {
  createPublicClient,
  http,
  createWalletClient,
  parseGwei,
  formatEther,
  Address, // For typing contractAddress
  Hex,     // For typing privateKey and bytecode
} from "viem";
import { mantleSepoliaTestnet } from "viem/chains"; // Using the direct import
import { privateKeyToAccount } from "viem/accounts";

import * as dotenv from "dotenv";
dotenv.config();
// Import ABI and bytecode from Hardhat artifacts for Splitter
// ENSURE THIS PATH IS CORRECT FOR YOUR PROJECT STRUCTURE
import { abi as splitterAbi, bytecode as splitterBytecode } from "../artifacts/contracts/Splitter.sol/Splitter.json";
 
// Ensure these environment variables are set in your .env file
const rpcProviderUrl = process.env.NEXT_PUBLIC_RPC_PROVIDER || ""; // Or RPC_PROVIDER if you use that
const deployerPrivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";

// For Splitter, we don't have explicit constructor args from the script
// const constructorArgsForSplitter: any[] = []; // Empty array

async function main() {
  if (!rpcProviderUrl) {
    throw new Error("RPC_PROVIDER URL (e.g., MANTLE_SEPOLIA_RPC_URL) not found in .env file");
  }
  if (!deployerPrivateKey) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }

  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet, // Using the direct chain import
    transport: http(rpcProviderUrl),
  });

  const blockNumber = await publicClient.getBlockNumber();
  console.log("Connected to Mantle Sepolia Testnet. Last block number:", blockNumber.toString());

  const account = privateKeyToAccount(`0x${deployerPrivateKey.startsWith('0x') ? deployerPrivateKey.substring(2) : deployerPrivateKey}` as Hex); // Ensure it's a Hex
  const deployer = createWalletClient({
    account,
    chain: mantleSepoliaTestnet,
    transport: http(rpcProviderUrl),
  });

  console.log("Deployer address:", deployer.account.address);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );

  console.log("Deploying the Splitter contract...");

  // Estimate or set EIP-1559 fees
  // You can try estimating them or setting them manually if you know good values
  let maxFeePerGas: bigint | undefined = undefined;
  let maxPriorityFeePerGas: bigint | undefined = undefined;

  try {
    const feeEstimate = await publicClient.estimateFeesPerGas({ type: "eip1559" });
    if (feeEstimate.maxFeePerGas) maxFeePerGas = feeEstimate.maxFeePerGas;
    if (feeEstimate.maxPriorityFeePerGas) maxPriorityFeePerGas = feeEstimate.maxPriorityFeePerGas;
    console.log(`Estimated fees: maxFeePerGas=${maxFeePerGas}, maxPriorityFeePerGas=${maxPriorityFeePerGas}`);
  } catch (e) {
    console.warn("Could not estimate EIP-1559 fees, will proceed without them or you can set manually.", e);
    // Set some default reasonable values for Mantle Sepolia if estimation fails
    // These are just examples, find current recommended values!
    maxPriorityFeePerGas = parseGwei("0.1"); // e.g., 0.1 Gwei
    maxFeePerGas = parseGwei("20");        // e.g., 20 Gwei (base fee + priority fee)
  }

  // Deploy the Splitter contract
  // The constructor `constructor() Ownable(msg.sender)` does not take arguments from the script
  const deployTxHash = await deployer.deployContract({
    abi: splitterAbi,
    bytecode: splitterBytecode as Hex, // Type assertion for bytecode
    account: deployer.account,
    // args: constructorArgsForSplitter, // No args for Splitter constructor from script
  });

  console.log("Deployment transaction sent. Hash:", deployTxHash);
  console.log("Waiting for transaction confirmations...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash: deployTxHash });

  if (!receipt.contractAddress) {
    throw new Error(
      "Contract address not found in transaction receipt. Deployment may have failed or receipt is malformed."
    );
  }
  const contractAddress: Address = receipt.contractAddress;
  console.log("Splitter contract deployed at:", contractAddress);
  console.log(`Transaction included in block: ${receipt.blockNumber}`);


  // Verify the Contract on Mantlescan (via Hardhat Etherscan plugin)
  // Make sure ETHERSCAN_API_KEY (or equivalent for Mantlescan) is set in .env if required by plugin,
  // and hardhat.config.ts is configured for Mantlescan verification.
  if (hre.network.name === "mantleSepolia") { // Check if on the correct network for verification
    console.log("Waiting a few seconds before attempting verification (for block explorer indexing)...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30-second delay

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [], // Splitter constructor takes no args from script
        // contract: "contracts/Splitter.sol:Splitter" // Optional: if ambiguity
      });
      console.log("Splitter contract verified successfully on Mantlescan!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract is already verified on Mantlescan.");
      } else {
        console.error("Error verifying contract on Mantlescan:", error.message);
      }
    }
  } else {
    console.log(`Skipping verification. Current network: ${hre.network.name}. Contract Address: ${contractAddress}`);
  }
}

main().catch((err) => {
  console.error("Unhandled error in main function:", err);
  process.exitCode = 1;
});