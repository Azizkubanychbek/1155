const { Wallet, Provider } = require("zksync-ethers");
const hre = require("hardhat");

async function main() {
  console.log("🍳 Adding recipes to RecipeRegistry...\n");

  // Initialize provider
  const provider = new Provider("https://sepolia.era.zksync.dev");
  
  // Initialize wallet
  const privateKey = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const wallet = new Wallet(privateKey, provider);
  console.log(`📝 Using wallet: ${wallet.address}`);
  
  // Contract address
  const recipeRegistryAddress = "0x47f5e7968D0E6FFf98965A5806B8Fdff21e6f871";
  const usageRightsAddress = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";
  
  // RecipeRegistry ABI (simplified)
  const recipeRegistryABI = [
    "function registerRecipe(tuple(address token, uint256 id, uint256 amount)[] inputs, address outputToken, uint256 outputId, uint256 outputAmount) external",
    "function getRecipeCount() view returns (uint256)",
    "function getRecipe(uint256 recipeId) view returns (tuple(tuple(address token, uint256 id, uint256 amount)[] inputs, address outputToken, uint256 outputId, uint256 outputAmount, bool active))"
  ];
  
  const { ethers } = require("ethers");
  const recipeRegistry = new ethers.Contract(recipeRegistryAddress, recipeRegistryABI, wallet);
  
  try {
    // Check current recipe count
    const currentCount = await recipeRegistry.getRecipeCount();
    console.log(`📊 Current recipe count: ${currentCount.toString()}\n`);
    
    if (currentCount.toString() === "0") {
      console.log("📝 Adding sample recipes...\n");
      
      // Recipe 1: Sword + Shield = Blessed Shield
      console.log("🍳 Adding recipe: Sword + Shield = Blessed Shield");
      const inputs1 = [
        { token: usageRightsAddress, id: 1, amount: 1 }, // Sword
        { token: usageRightsAddress, id: 2, amount: 1 }  // Shield
      ];
      const tx1 = await recipeRegistry.registerRecipe(
        inputs1,
        usageRightsAddress, // outputToken
        42, // outputId (Blessed Shield)
        1 // outputAmount
      );
      await tx1.wait();
      console.log("✅ Recipe 1 added successfully\n");
      
      // Recipe 2: 3 Herbs = Potion
      console.log("🍳 Adding recipe: 3 Herbs = Potion");
      const inputs2 = [
        { token: usageRightsAddress, id: 3, amount: 3 } // Herb
      ];
      const tx2 = await recipeRegistry.registerRecipe(
        inputs2,
        usageRightsAddress, // outputToken
        4, // outputId (Potion)
        1 // outputAmount
      );
      await tx2.wait();
      console.log("✅ Recipe 2 added successfully\n");
      
      // Check final recipe count
      const finalCount = await recipeRegistry.getRecipeCount();
      console.log(`📊 Final recipe count: ${finalCount.toString()}\n`);
      
      console.log("🎉 All recipes added successfully!");
      
    } else {
      console.log("ℹ️ Recipes already exist, skipping...");
    }
    
  } catch (error) {
    console.error("❌ Error adding recipes:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
