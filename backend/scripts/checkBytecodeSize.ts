// scripts/checkBytecodeSize.ts
import hre from "hardhat"; 
import fs from "fs";       
import path from "path"; 

async function main() {
  // List of contract names to check. 
  const contractNames = ["Splitter"];  

  if (contractNames.length === 0) {
    console.log("No contract names provided in the script. Exiting.");
    return;
  }

  console.log("Checking bytecode sizes of compiled contracts...");
  console.log("----------------------------------------------------");

  for (const contractName of contractNames) {
    try { 
      const artifact = await hre.artifacts.readArtifact(contractName);

      // Check if bytecode exists and is not just "0x" (which can happen for interfaces or abstract contracts)
      if (!artifact.bytecode || artifact.bytecode === "0x") {
        console.log(`\nContract: ${contractName}`);
        console.log("  Bytecode: Not found or empty (is it an interface or an abstract contract?).");
        console.log("----------------------------------------------------");
        continue;
      }

      // The bytecode string from the artifact includes the "0x" prefix
      const bytecodeHex = artifact.bytecode;
      // Subtract 2 for the "0x" prefix to get the length of the hex characters
      const bytecodeLengthChars = bytecodeHex.length - 2;
      // Each byte is represented by two hexadecimal characters
      const bytecodeSizeBytes = bytecodeLengthChars / 2;

      // EIP-170 contract size limit (24 KiB)
      const eip170LimitBytes = 24576;

      const typicalArtifactPath = path.join(
        hre.config.paths.artifacts, 
        `contracts/${contractName}.sol`,
        `${contractName}.json`
      );
      console.log(`\nContract: ${contractName} (Artifact source: ${artifact.sourceName})`);
      console.log(`  Bytecode Hex (first 60 chars): ${bytecodeHex.substring(0, 60)}...`);
      console.log(`  Hex Length (without 0x): ${bytecodeLengthChars} characters`);
      console.log(`  Bytecode Size: ${bytecodeSizeBytes} bytes (${(bytecodeSizeBytes / 1024).toFixed(2)} KB)`);

      if (bytecodeSizeBytes > eip170LimitBytes) {
        console.warn(`  WARNING! Bytecode size exceeds the EIP-170 limit of ${eip170LimitBytes} bytes.`);
        console.warn(`  This might prevent deployment on mainnet or L2s that enforce this limit.`);
      } else {
        console.log(`  Size is WITHIN the EIP-170 limit of ${eip170LimitBytes} bytes.`);
      }
      console.log("----------------------------------------------------");

    } catch (error: any) {
      console.error(`\nError processing contract ${contractName}:`);
      if (error.message.includes(`Artifact for contract "${contractName}" not found.`)) {
        console.error(`  Artifact for "${contractName}" not found. Make sure it's compiled and the name is correct.`);
      } else {
        console.error(`  ${error.message}`);
      }
      console.log("----------------------------------------------------");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });