const { ethers } = require("ethers");

const RPC_URL = "https://zkrpc-sepolia.xsollazk.com";
const PRIVATE_KEY = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract address
const USAGE_RIGHTS_ADDRESS = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";

// UsageRights1155 ABI
const usageRightsABI = [
  "function mint(address to, uint256 id, uint256 amount, bytes memory data) external",
  "function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external",
  "function balanceOf(address account, uint256 id) view returns (uint256)"
];

async function mintMoreItems() {
  try {
    console.log("🎯 Minting more items...");
    console.log(`📡 Network: ${RPC_URL}`);
    console.log(`👤 Wallet: ${wallet.address}`);
    console.log(`🏗️ Contract: ${USAGE_RIGHTS_ADDRESS}`);

    const usageRights = new ethers.Contract(USAGE_RIGHTS_ADDRESS, usageRightsABI, wallet);

    // Check current balances
    console.log("\n📊 Current Balances:");
    const swordBalance = await usageRights.balanceOf(wallet.address, 1);
    const shieldBalance = await usageRights.balanceOf(wallet.address, 2);
    const herbBalance = await usageRights.balanceOf(wallet.address, 3);
    const potionBalance = await usageRights.balanceOf(wallet.address, 4);
    const blessedShieldBalance = await usageRights.balanceOf(wallet.address, 42);
    
    console.log(`⚔️ Sword: ${swordBalance.toString()}`);
    console.log(`🛡️ Shield: ${shieldBalance.toString()}`);
    console.log(`🌿 Herb: ${herbBalance.toString()}`);
    console.log(`🧪 Potion: ${potionBalance.toString()}`);
    console.log(`✨ Blessed Shield: ${blessedShieldBalance.toString()}`);

    // Mint more items
    console.log("\n🎯 Minting additional items...");
    
    // Mint 50 more swords
    console.log("⚔️ Minting 50 more swords...");
    const swordTx = await usageRights.mint(wallet.address, 1, 50, "0x");
    await swordTx.wait();
    console.log("✅ 50 swords minted");

    // Mint 30 more shields
    console.log("🛡️ Minting 30 more shields...");
    const shieldTx = await usageRights.mint(wallet.address, 2, 30, "0x");
    await shieldTx.wait();
    console.log("✅ 30 shields minted");

    // Mint 100 more herbs
    console.log("🌿 Minting 100 more herbs...");
    const herbTx = await usageRights.mint(wallet.address, 3, 100, "0x");
    await herbTx.wait();
    console.log("✅ 100 herbs minted");

    // Mint 20 potions
    console.log("🧪 Minting 20 potions...");
    const potionTx = await usageRights.mint(wallet.address, 4, 20, "0x");
    await potionTx.wait();
    console.log("✅ 20 potions minted");

    // Mint 20 more blessed shields
    console.log("✨ Minting 20 more blessed shields...");
    const blessedShieldTx = await usageRights.mint(wallet.address, 42, 20, "0x");
    await blessedShieldTx.wait();
    console.log("✅ 20 blessed shields minted");

    // Check new balances
    console.log("\n📊 New Balances:");
    const newSwordBalance = await usageRights.balanceOf(wallet.address, 1);
    const newShieldBalance = await usageRights.balanceOf(wallet.address, 2);
    const newHerbBalance = await usageRights.balanceOf(wallet.address, 3);
    const newPotionBalance = await usageRights.balanceOf(wallet.address, 4);
    const newBlessedShieldBalance = await usageRights.balanceOf(wallet.address, 42);
    
    console.log(`⚔️ Sword: ${newSwordBalance.toString()}`);
    console.log(`🛡️ Shield: ${newShieldBalance.toString()}`);
    console.log(`🌿 Herb: ${newHerbBalance.toString()}`);
    console.log(`🧪 Potion: ${newPotionBalance.toString()}`);
    console.log(`✨ Blessed Shield: ${newBlessedShieldBalance.toString()}`);

    console.log("\n🎉 Minting completed!");
    console.log("💡 Now you have plenty of items for testing!");

  } catch (error) {
    console.error("❌ Error minting items:", error);
  }
}

mintMoreItems();
