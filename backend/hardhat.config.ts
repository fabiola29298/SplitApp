import * as dotenv from "dotenv";
dotenv.config();
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
require("@nomicfoundation/hardhat-verify");
const config: HardhatUserConfig = {
  solidity: { 
    version: "0.8.20", // Use your contract's Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Lower 'runs' optimizes more for deployment size, higher for runtime gas
                   // 200 is a common default, try reducing it if size is an issue.
                   // E.g., try 10, 50, or even 1 if desperate for size.
      
  },},},
  networks: {
    mantleSepolia: {
      url: process.env.NEXT_PUBLIC_RPC_PROVIDER,
      accounts: [process.env.NEXT_PUBLIC_PRIVATE_KEY ?? ""]
    }
  },

  etherscan: { // This section is for hardhat-verify
    apiKey: {
      // For Mantle Sepolia, the API key is not strictly required for verification 
      // Often, for testnets, "NO_API_KEY_NEEDED" or just a random string works if not enforced.
      mantleSepolia: "NO_API_KEY_NEEDED" // e.g., "NO_API_KEY_NEEDED" if it works
    },
    customChains: [
      {
        network: "mantleSepolia",
        chainId: 5003, // Chain ID for Mantle Sepolia Testnet
        urls: {
          apiURL: "https://explorer.sepolia.mantle.xyz/api", // API URL for verification
          browserURL: "https://explorer.sepolia.mantle.xyz/" // Browser URL
        }
      }
    ]
  },
  
};

export default config;
