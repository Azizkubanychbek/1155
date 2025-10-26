const { ethers } = require("ethers");

const RPC_URL = "https://zkrpc-sepolia.xsollazk.com";
const PRIVATE_KEY = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract addresses
const USAGE_RIGHTS_ADDRESS = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";
const RECIPE_REGISTRY_ADDRESS = "0x47f5e7968D0E6FFf98965A5806B8Fdff21e6f871";

// UsageRights1155 ABI
const usageRightsABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) view returns (bool)"
];

// RecipeRegistry ABI
const recipeRegistryABI = [
  "function craft(uint256 recipeId, address receiver) external",
  "function getRecipeCount() view returns (uint256)",
  "function getAllRecipes() view returns (tuple(tuple(address token, uint256 id, uint256 amount)[] inputs, address outputToken, uint256 outputId, uint256 outputAmount, bool active)[])"
];

async function testCraft() {
  try {
    console.log("🧪 Testing craft functionality...");
    console.log(`📡 Network: ${RPC_URL}`);
    console.log(`👤 Wallet: ${wallet.address}`);

    const usageRights = new ethers.Contract(USAGE_RIGHTS_ADDRESS, usageRightsABI, wallet);
    const recipeRegistry = new ethers.Contract(RECIPE_REGISTRY_ADDRESS, recipeRegistryABI, wallet);

    // Check balances
    const swordBalance = await usageRights.balanceOf(wallet.address, 1);
    const shieldBalance = await usageRights.balanceOf(wallet.address, 2);
    const herbBalance = await usageRights.balanceOf(wallet.address, 3);
    const blessedShieldBalance = await usageRights.balanceOf(wallet.address, 42);
    
    console.log("\n📊 Current Balances:");
    console.log(`⚔️ Sword: ${swordBalance.toString()}`);
    console.log(`🛡️ Shield: ${shieldBalance.toString()}`);
    console.log(`🌿 Herb: ${herbBalance.toString()}`);
    console.log(`✨ Blessed Shield: ${blessedShieldBalance.toString()}`);

    // Check recipe count
    const recipeCount = await recipeRegistry.getRecipeCount();
    console.log(`\n📋 Recipe Count: ${recipeCount.toString()}`);

    // Get all recipes
    const recipes = await recipeRegistry.getAllRecipes();
    console.log(`\n🍳 Recipes: ${recipes.length}`);

    if (recipes.length > 0) {
      const recipe = recipes[0];
      console.log(`\n🔍 First Recipe:`);
      console.log(`  Inputs: ${recipe.inputs.length}`);
      console.log(`  Output: ${recipe.outputToken} ID:${recipe.outputId} Amount:${recipe.outputAmount}`);
      console.log(`  Active: ${recipe.active}`);

      // Check if we have enough ingredients
      const hasShield = shieldBalance >= 1;
      const hasHerb = herbBalance >= 3;
      
      console.log(`\n✅ Can craft: Shield=${hasShield}, Herb=${hasHerb}`);

      if (hasShield && hasHerb) {
        console.log("\n🎯 Attempting to craft...");
        
        // Set approval if needed
        const isApproved = await usageRights.isApprovedForAll(wallet.address, RECIPE_REGISTRY_ADDRESS);
        if (!isApproved) {
          console.log("🔐 Setting approval...");
          const approveTx = await usageRights.setApprovalForAll(RECIPE_REGISTRY_ADDRESS, true);
          await approveTx.wait();
          console.log("✅ Approval set");
        }

        // Try to craft
        try {
          const craftTx = await recipeRegistry.craft(0, wallet.address);
          await craftTx.wait();
          console.log("🎉 Craft successful!");
          
          // Check new balances
          const newBlessedShieldBalance = await usageRights.balanceOf(wallet.address, 42);
          console.log(`✨ New Blessed Shield balance: ${newBlessedShieldBalance.toString()}`);
          
        } catch (craftError) {
          console.error("❌ Craft failed:", craftError.message);
        }
      }
    }

  } catch (error) {
    console.error("❌ Error testing craft:", error);
  }
}

testCraft();
