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
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external"
];

async function fundRecipeRegistry() {
  try {
    console.log("🔧 Funding RecipeRegistry contract...");
    console.log(`📡 Network: ${RPC_URL}`);
    console.log(`👤 Wallet: ${wallet.address}`);
    console.log(`🏗️ UsageRights: ${USAGE_RIGHTS_ADDRESS}`);
    console.log(`🍳 RecipeRegistry: ${RECIPE_REGISTRY_ADDRESS}`);

    const usageRights = new ethers.Contract(USAGE_RIGHTS_ADDRESS, usageRightsABI, wallet);

    // Check if we need to approve RecipeRegistry
    const isApproved = await usageRights.isApprovedForAll(wallet.address, RECIPE_REGISTRY_ADDRESS);
    console.log(`✅ Approved for all: ${isApproved}`);

    if (!isApproved) {
      console.log("🔐 Setting approval for RecipeRegistry...");
      const approveTx = await usageRights.setApprovalForAll(RECIPE_REGISTRY_ADDRESS, true);
      await approveTx.wait();
      console.log("✅ Approval set");
    }

    // Transfer Blessed Shields directly to RecipeRegistry
    console.log("💰 Transferring Blessed Shields to RecipeRegistry...");
    const transferTx = await usageRights.safeTransferFrom(
      wallet.address, 
      RECIPE_REGISTRY_ADDRESS, 
      42, // Blessed Shield ID
      5,  // Amount
      "0x" // Empty data
    );
    await transferTx.wait();
    console.log("✅ Blessed Shields transferred to RecipeRegistry");

    // Check balances
    const walletBalance = await usageRights.balanceOf(wallet.address, 42);
    const contractBalance = await usageRights.balanceOf(RECIPE_REGISTRY_ADDRESS, 42);
    
    console.log("\n📊 Final Balances:");
    console.log(`👤 Wallet Blessed Shield: ${walletBalance.toString()}`);
    console.log(`🍳 RecipeRegistry Blessed Shield: ${contractBalance.toString()}`);

    console.log("\n🎉 RecipeRegistry funding completed!");
    console.log("💡 Now you can craft Blessed Shields!");

  } catch (error) {
    console.error("❌ Error funding RecipeRegistry:", error);
  }
}

fundRecipeRegistry();
