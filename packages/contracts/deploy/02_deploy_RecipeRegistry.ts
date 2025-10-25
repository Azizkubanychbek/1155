import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config();

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for RecipeRegistry`);

  // Initialize the wallet.
  const privateKey = process.env.PRIVATE_KEY || "cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const wallet = new Wallet(privateKey);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load the contract artifact
  const artifact = await deployer.loadArtifact("RecipeRegistry");

  // Deploy this contract. The returned object will be of a `Contract` type.
  const contract = await deployer.deploy(artifact, []);

  // Show the contract info.
  console.log(`${artifact.contractName} was deployed to ${contract.address}`);

  // Add demo recipes
  console.log("Adding demo recipes...");
  
  // Get UsageRights1155 address from environment variable
  const usageRightsAddress = process.env.USAGE_RIGHTS_ADDRESS;
  
  if (!usageRightsAddress) {
    console.log("USAGE_RIGHTS_ADDRESS environment variable not set. Skipping recipe registration.");
  } else {
    console.log('Using UsageRights1155 address from environment:', usageRightsAddress);
    // Recipe 1: Herb x3 + Shield x1 -> Blessed Shield (ID: 42)
    const ingredients1 = [
      {
        token: usageRightsAddress,
        id: 3, // Herb
        amount: 3
      },
      {
        token: usageRightsAddress,
        id: 2, // Shield
        amount: 1
      }
    ];
    
    await contract.registerRecipe(
      ingredients1,
      usageRightsAddress, // Output token (same as input)
      42, // Blessed Shield ID
      1   // Output amount
    );
    
    console.log("Added recipe: 3x Herb + 1x Shield -> 1x Blessed Shield");
    
    // Recipe 2: Herb x5 + Potion x2 -> Magic Potion (ID: 43)
    const ingredients2 = [
      {
        token: usageRightsAddress,
        id: 3, // Herb
        amount: 5
      },
      {
        token: usageRightsAddress,
        id: 4, // Potion
        amount: 2
      }
    ];
    
    await contract.registerRecipe(
      ingredients2,
      usageRightsAddress, // Output token (same as input)
      43, // Magic Potion ID
      1   // Output amount
    );
    
    console.log("Added recipe: 5x Herb + 2x Potion -> 1x Magic Potion");
    
    // Recipe 3: Sword x1 + Herb x2 -> Enchanted Sword (ID: 44)
    const ingredients3 = [
      {
        token: usageRightsAddress,
        id: 1, // Sword
        amount: 1
      },
      {
        token: usageRightsAddress,
        id: 3, // Herb
        amount: 2
      }
    ];
    
    await contract.registerRecipe(
      ingredients3,
      usageRightsAddress, // Output token (same as input)
      44, // Enchanted Sword ID
      1   // Output amount
    );
    
    console.log("Added recipe: 1x Sword + 2x Herb -> 1x Enchanted Sword");
  }

  return contract.address;
}
