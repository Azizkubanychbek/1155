const { ethers } = require("ethers");

const RPC_URL = "https://sepolia.era.zksync.dev";
const PRIVATE_KEY = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function deployRecipeOnly() {
  try {
    console.log("🚀 Deploying RecipeRegistry only...");
    console.log(`📡 Network: ${RPC_URL}`);
    console.log(`👤 Wallet: ${wallet.address}`);

    // We need to use Hardhat to get the compiled bytecode
    console.log("📦 Compiling contracts...");
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      // Compile contracts
      await execAsync('npx hardhat compile');
      console.log("✅ Compilation successful");
      
      // Now try to deploy using Hardhat
      console.log("🚀 Deploying RecipeRegistry...");
      const { stdout } = await execAsync('npx hardhat run scripts/deploy.js --network zkSyncSepolia');
      console.log("✅ Deployment successful");
      console.log(stdout);
      
    } catch (error) {
      console.error("❌ Deployment failed:", error.message);
      console.log("💡 Let's try a different approach...");
      
      // Try to deploy manually by reading the artifact
      console.log("📖 Reading artifact file...");
      
      try {
        const fs = require('fs');
        const path = require('path');
        
        const artifactPath = path.join(__dirname, '../artifacts/contracts/RecipeRegistry.sol/RecipeRegistry.json');
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        
        console.log("✅ Artifact loaded");
        console.log(`📦 Bytecode length: ${artifact.bytecode.length}`);
        
        // Deploy using the artifact
        const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
        const recipeRegistry = await factory.deploy();
        await recipeRegistry.waitForDeployment();
        
        const address = await recipeRegistry.getAddress();
        console.log(`✅ RecipeRegistry deployed at: ${address}`);
        
        // Fund the contract
        console.log("💰 Funding RecipeRegistry...");
        
        const usageRightsAddress = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";
        const usageRightsABI = [
          "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external"
        ];
        
        const usageRights = new ethers.Contract(usageRightsAddress, usageRightsABI, wallet);
        
        // Transfer 10 Blessed Shields to RecipeRegistry
        const transferTx = await usageRights.safeTransferFrom(
          wallet.address, 
          address, 
          42, // Blessed Shield ID
          10, // Amount
          "0x" // Empty data
        );
        await transferTx.wait();
        console.log("✅ RecipeRegistry funded with 10 Blessed Shields");
        
        console.log("\n🎉 RecipeRegistry deployment completed!");
        console.log(`📍 New address: ${address}`);
        console.log("💡 Update your frontend addresses.ts with this new address!");
        
      } catch (artifactError) {
        console.error("❌ Artifact error:", artifactError.message);
        console.log("💡 Please run: npx hardhat compile first");
      }
    }

  } catch (error) {
    console.error("❌ Error deploying RecipeRegistry:", error);
  }
}

deployRecipeOnly();

