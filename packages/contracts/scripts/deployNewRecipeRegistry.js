const { ethers } = require("ethers");

const RPC_URL = "https://zkrpc-sepolia.xsollazk.com";
const PRIVATE_KEY = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function deployNewRecipeRegistry() {
  try {
    console.log("🚀 Deploying NEW RecipeRegistry with ERC1155Holder...");
    console.log(`📡 Network: ${RPC_URL}`);
    console.log(`👤 Wallet: ${wallet.address}`);

    // We need to use Hardhat to deploy the fixed contract
    console.log("📦 Using Hardhat to deploy...");
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      // First, let's create a simple deploy script
      const deployScript = `
const { ethers } = require("ethers");

async function main() {
  console.log("🚀 Deploying RecipeRegistry...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const RecipeRegistry = await ethers.getContractFactory("RecipeRegistry");
  const recipeRegistry = await RecipeRegistry.deploy();
  await recipeRegistry.waitForDeployment();

  console.log("RecipeRegistry deployed to:", await recipeRegistry.getAddress());
  
  // Fund the contract
  console.log("💰 Funding RecipeRegistry...");
  
  const usageRightsAddress = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";
  const usageRights = await ethers.getContractAt("UsageRights1155", usageRightsAddress);
  
  // Transfer 10 Blessed Shields to RecipeRegistry
  const transferTx = await usageRights.safeTransferFrom(
    deployer.address, 
    await recipeRegistry.getAddress(), 
    42, // Blessed Shield ID
    10, // Amount
    "0x" // Empty data
  );
  await transferTx.wait();
  console.log("✅ RecipeRegistry funded with 10 Blessed Shields");
  
  console.log("🎉 Deployment completed!");
  console.log("📍 New RecipeRegistry address:", await recipeRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

      // Write the deploy script
      const fs = require('fs');
      fs.writeFileSync('scripts/tempDeploy.js', deployScript);
      
      // Run the deploy script
      const { stdout } = await execAsync('npx hardhat run scripts/tempDeploy.js --network xsollaZkSepolia');
      console.log("✅ Deployment successful");
      console.log(stdout);
      
      // Clean up
      fs.unlinkSync('scripts/tempDeploy.js');
      
    } catch (error) {
      console.error("❌ Hardhat deployment failed:", error.message);
      console.log("💡 Let's try a different approach...");
      
      // Fallback: manual deployment
      console.log("🔄 Trying manual deployment...");
      console.log("❌ Cannot deploy without proper Hardhat setup");
      console.log("💡 Please run: npx hardhat run scripts/deploy.js --network xsollaZkSepolia");
    }

  } catch (error) {
    console.error("❌ Error deploying RecipeRegistry:", error);
  }
}

deployNewRecipeRegistry();
