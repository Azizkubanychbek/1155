const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = "https://sepolia.era.zksync.dev";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("🚀 Deploying to zkSync Sepolia...");
console.log("📡 RPC:", RPC_URL);
console.log("👤 Deployer:", wallet.address);

async function deployContracts() {
  try {
    // Deploy ReputationSystem
    console.log("\n📦 Deploying ReputationSystem...");
    const reputationFactory = new ethers.ContractFactory([], [], wallet);
    const reputationSystem = await reputationFactory.deploy();
    await reputationSystem.waitForDeployment();
    const reputationAddress = await reputationSystem.getAddress();
    console.log("✅ ReputationSystem:", reputationAddress);

    // Deploy UsageRights1155
    console.log("\n📦 Deploying UsageRights1155...");
    const usageRightsFactory = new ethers.ContractFactory([], [], wallet);
    const usageRights = await usageRightsFactory.deploy(
      "https://api.backpackguilds.com/metadata/{id}.json",
      reputationAddress
    );
    await usageRights.waitForDeployment();
    const usageRightsAddress = await usageRights.getAddress();
    console.log("✅ UsageRights1155:", usageRightsAddress);

    // Deploy PartyBackpack
    console.log("\n📦 Deploying PartyBackpack...");
    const partyBackpackFactory = new ethers.ContractFactory([], [], wallet);
    const partyBackpack = await partyBackpackFactory.deploy(usageRightsAddress);
    await partyBackpack.waitForDeployment();
    const partyBackpackAddress = await partyBackpack.getAddress();
    console.log("✅ PartyBackpack:", partyBackpackAddress);

    // Deploy RecipeRegistry
    console.log("\n📦 Deploying RecipeRegistry...");
    const recipeRegistryFactory = new ethers.ContractFactory([], [], wallet);
    const recipeRegistry = await recipeRegistryFactory.deploy();
    await recipeRegistry.waitForDeployment();
    const recipeRegistryAddress = await recipeRegistry.getAddress();
    console.log("✅ RecipeRegistry:", recipeRegistryAddress);

    // Deploy RentalEscrow
    console.log("\n📦 Deploying RentalEscrow...");
    const rentalEscrowFactory = new ethers.ContractFactory([], [], wallet);
    const rentalEscrow = await rentalEscrowFactory.deploy(usageRightsAddress);
    await rentalEscrow.waitForDeployment();
    const rentalEscrowAddress = await rentalEscrow.getAddress();
    console.log("✅ RentalEscrow:", rentalEscrowAddress);

    // Save addresses
    const addresses = {
      ReputationSystem: reputationAddress,
      UsageRights1155: usageRightsAddress,
      PartyBackpack: partyBackpackAddress,
      RecipeRegistry: recipeRegistryAddress,
      RentalEscrow: rentalEscrowAddress
    };

    console.log("\n📝 Contract Addresses:");
    console.log(JSON.stringify(addresses, null, 2));

    // Update frontend addresses
    const fs = require('fs');
    const path = require('path');
    
    const frontendAddressesPath = path.join(__dirname, "../frontend/src/lib/addresses.ts");
    const addressesContent = `export const CONTRACT_ADDRESSES = {
  ReputationSystem: "${reputationAddress}",
  UsageRights1155: "${usageRightsAddress}",
  PartyBackpack: "${partyBackpackAddress}",
  RecipeRegistry: "${recipeRegistryAddress}",
  RentalEscrow: "${rentalEscrowAddress}"
} as const;

export const CHAIN_CONFIG = {
  chainId: 300,
  rpcUrl: "https://sepolia.era.zksync.dev"
} as const;
`;

    fs.writeFileSync(frontendAddressesPath, addressesContent);
    console.log("✅ Updated frontend addresses");

    console.log("\n🎉 All contracts deployed successfully to zkSync Sepolia!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

deployContracts();
