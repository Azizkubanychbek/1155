const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying to zkSync Sepolia...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  // Deploy ReputationSystem
  console.log("\n📦 Deploying ReputationSystem...");
  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  const reputationAddress = await reputationSystem.getAddress();
  console.log("✅ ReputationSystem:", reputationAddress);

  // Deploy UsageRights1155
  console.log("\n📦 Deploying UsageRights1155...");
  const UsageRights1155 = await hre.ethers.getContractFactory("UsageRights1155");
  const usageRights = await UsageRights1155.deploy(
    "https://api.backpackguilds.com/metadata/{id}.json",
    reputationAddress
  );
  await usageRights.waitForDeployment();
  const usageRightsAddress = await usageRights.getAddress();
  console.log("✅ UsageRights1155:", usageRightsAddress);

  // Deploy PartyBackpack
  console.log("\n📦 Deploying PartyBackpack...");
  const PartyBackpack = await hre.ethers.getContractFactory("PartyBackpack");
  const partyBackpack = await PartyBackpack.deploy(usageRightsAddress);
  await partyBackpack.waitForDeployment();
  const partyBackpackAddress = await partyBackpack.getAddress();
  console.log("✅ PartyBackpack:", partyBackpackAddress);

  // Deploy RecipeRegistry
  console.log("\n📦 Deploying RecipeRegistry...");
  const RecipeRegistry = await hre.ethers.getContractFactory("RecipeRegistry");
  const recipeRegistry = await RecipeRegistry.deploy();
  await recipeRegistry.waitForDeployment();
  const recipeRegistryAddress = await recipeRegistry.getAddress();
  console.log("✅ RecipeRegistry:", recipeRegistryAddress);

  // Deploy RentalEscrow
  console.log("\n📦 Deploying RentalEscrow...");
  const RentalEscrow = await hre.ethers.getContractFactory("RentalEscrow");
  const rentalEscrow = await RentalEscrow.deploy(usageRightsAddress);
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
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});