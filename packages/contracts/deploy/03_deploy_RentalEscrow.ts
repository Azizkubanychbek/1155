import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";

// Load environment variables
require('dotenv').config();

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for RentalEscrow`);

  // Initialize the wallet.
  const privateKey = process.env.PRIVATE_KEY || "cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const wallet = new Wallet(privateKey);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load the contract artifact
  const artifact = await deployer.loadArtifact("RentalEscrow");

  // Get ReputationSystem address from previous deployment
  const reputationSystemDeployment = await hre.deployments.get("ReputationSystem");
  console.log("Using ReputationSystem at:", reputationSystemDeployment.address);

  // Deploy this contract. The returned object will be of a `Contract` type.
  const contract = await deployer.deploy(artifact, [reputationSystemDeployment.address]);

  // Show the contract info.
  console.log(`${artifact.contractName} was deployed to ${contract.address}`);

  return contract.address;
}
