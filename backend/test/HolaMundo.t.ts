import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("Tests de Hola Mundo", function () {
  async function deployContractFixture() {
    const publicClient = await hre.viem.getPublicClient();
    const [owner, otraCuenta] = await hre.viem.getWalletClients();
    const holaMundoContract = await hre.viem.deployContract("HolaMundo");
    return {
      owner,
      holaMundoContract,
      publicClient,
      otraCuenta
    };
  }

  it("debe regresar un Hola Mundo", async function () {
    const { holaMundoContract } = await loadFixture(deployContractFixture);
    const holaMundoTexto = await holaMundoContract.read.holaMundo();
    expect(holaMundoTexto).to.equal("Hola Mundo");
  });

  it("El owner debería ser el address de la wallet que despliega", async () => {
    const { holaMundoContract, owner } = await loadFixture(deployContractFixture);
    const holaMundoOwner = await holaMundoContract.read.propietario();
    expect(holaMundoOwner.toLowerCase()).to.equal(owner.account.address);
  });

  it("Should not allow anyone other than owner to call transferOwnership", async function () {
    const { holaMundoContract, otraCuenta } = await loadFixture(
      deployContractFixture
    );
    const helloWorldContractAsOtherAccount = await hre.viem.getContractAt(
      "HolaMundo",
      holaMundoContract.address,
      { client: { wallet: otraCuenta } }
    );
    await expect(
      helloWorldContractAsOtherAccount.write.transferirPropiedad([
        otraCuenta.account.address,
      ])
    ).to.be.rejectedWith("El que llama no es el propietario");
  });

  it("Should execute transferOwnership correctly", async function () {
    const { publicClient, holaMundoContract, owner, otraCuenta } = await loadFixture(deployContractFixture);
    const txHash = await holaMundoContract.write.transferirPropiedad([
      otraCuenta.account.address,
    ]);
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.equal("success");
    const contractOwner = await holaMundoContract.read.propietario();
    expect(contractOwner.toLowerCase()).to.equal(otraCuenta.account.address);
    const holaMundoDesdeLaOtraCuenta = await hre.viem.getContractAt(
      "HolaMundo",
      holaMundoContract.address,
      { client: { wallet: owner } }
    );
    await expect(
      holaMundoDesdeLaOtraCuenta.write.transferirPropiedad([
        owner.account.address,
      ])
    ).to.be.rejectedWith("El que llama no es el propietario");
  });

  it("No debería dejar que alguien distinto al propietario cambie el texto", async function () {
    // TODO
    throw Error("Not implemented");
  });

  it("Debe cambiarse el texto correctamente", async function () {
    // TODO
    throw Error("Not implemented");
  });
});
