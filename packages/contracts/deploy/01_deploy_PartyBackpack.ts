import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";

// Load environment variables
require('dotenv').config();

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for PartyBackpack`);

  // Initialize the wallet.
  const privateKey = process.env.PRIVATE_KEY || "cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const wallet = new Wallet(privateKey);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load the contract artifact
  const artifact = await deployer.loadArtifact("PartyBackpack");

  // Get the UsageRights1155 contract address from environment variable
  const usageRightsAddress = process.env.USAGE_RIGHTS_ADDRESS;
  
  if (!usageRightsAddress) {
    throw new Error("USAGE_RIGHTS_ADDRESS environment variable not set. Please set it in .env file.");
  }
  
  console.log('Using UsageRights1155 address from environment:', usageRightsAddress);

  // Deploy this contract. The returned object will be of a `Contract` type.
  const contract = await deployer.deploy(artifact, [usageRightsAddress]);

  // Show the contract info.
  console.log(`${artifact.contractName} was deployed to ${contract.address}`);

  return contract.address;
}
