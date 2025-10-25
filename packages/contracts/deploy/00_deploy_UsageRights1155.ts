import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";

// Load environment variables
require('dotenv').config();

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for UsageRights1155`);

  // Initialize the wallet.
  const privateKey = process.env.PRIVATE_KEY || "cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const wallet = new Wallet(privateKey);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load the contract artifact
  const artifact = await deployer.loadArtifact("UsageRights1155");

  // Deploy this contract. The returned object will be of a `Contract` type.
  const baseURI = "https://api.backpackguilds.com/metadata/";
  const contract = await deployer.deploy(artifact, [baseURI]);

  // Show the contract info.
  console.log(`${artifact.contractName} was deployed to ${contract.address}`);

  // Mint some demo tokens
  console.log("Minting demo tokens...");
  
  // Mint Sword (ID: 1) to the deployer
  await contract.mint(wallet.address, 1, 100, "0x");
  console.log("Minted 100 Swords (ID: 1)");
  
  // Mint Shield (ID: 2) to the deployer
  await contract.mint(wallet.address, 2, 50, "0x");
  console.log("Minted 50 Shields (ID: 2)");
  
  // Mint Herb (ID: 3) to the deployer
  await contract.mint(wallet.address, 3, 200, "0x");
  console.log("Minted 200 Herbs (ID: 3)");

  return contract.address;
}
