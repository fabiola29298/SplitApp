import { viem } from "hardhat";

async function main() {
  console.log("Vamos a desplegar nuestro contrato");
  console.log("Desplegando contrato...");
  const [owner, otraCuenta] = await viem.getWalletClients();
  console.log("Contrato desplegado");
}

main() 
