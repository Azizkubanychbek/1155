const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const { Wallet, Provider } = require("zksync-ethers");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying to zkSync Sepolia...");

  const provider = new Provider("https://sepolia.era.zksync.dev");
  const wallet = new Wallet("0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c", provider);
  const deployer = new Deployer(hre, wallet);

  console.log("👤 Deployer:", wallet.address);

  // Deploy ReputationSystem
  console.log("\n📦 Deploying ReputationSystem...");
  const reputationArtifact = await deployer.loadArtifact("ReputationSystem");
  const reputationSystem = await deployer.deploy(reputationArtifact);
  console.log("✅ ReputationSystem:", await reputationSystem.getAddress());

  // Deploy UsageRights1155
  console.log("\n📦 Deploying UsageRights1155...");
  const usageRightsArtifact = await deployer.loadArtifact("UsageRights1155");
  const usageRights = await deployer.deploy(usageRightsArtifact, [
    "https://api.backpackguilds.com/metadata/{id}.json",
    await reputationSystem.getAddress()
  ]);
  console.log("✅ UsageRights1155:", await usageRights.getAddress());

  // Deploy PartyBackpack
  console.log("\n📦 Deploying PartyBackpack...");
  const partyBackpackArtifact = await deployer.loadArtifact("PartyBackpack");
  const partyBackpack = await deployer.deploy(partyBackpackArtifact, [await usageRights.getAddress()]);
  console.log("✅ PartyBackpack:", await partyBackpack.getAddress());

  // Deploy RecipeRegistry
  console.log("\n📦 Deploying RecipeRegistry...");
  const recipeRegistryArtifact = await deployer.loadArtifact("RecipeRegistry");
  const recipeRegistry = await deployer.deploy(recipeRegistryArtifact);
  console.log("✅ RecipeRegistry:", await recipeRegistry.getAddress());

  // Deploy RentalEscrow
  console.log("\n📦 Deploying RentalEscrow...");
  const rentalEscrowArtifact = await deployer.loadArtifact("RentalEscrow");
  const rentalEscrow = await deployer.deploy(rentalEscrowArtifact, [await usageRights.getAddress()]);
  console.log("✅ RentalEscrow:", await rentalEscrow.getAddress());

  const addresses = {
    ReputationSystem: await reputationSystem.getAddress(),
    UsageRights1155: await usageRights.getAddress(),
    PartyBackpack: await partyBackpack.getAddress(),
    RecipeRegistry: await recipeRegistry.getAddress(),
    RentalEscrow: await rentalEscrow.getAddress()
  };

  console.log("\n📝 Addresses:", JSON.stringify(addresses, null, 2));

  const addressesContent = `export const CONTRACT_ADDRESSES = {
  ReputationSystem: "${addresses.ReputationSystem}",
  UsageRights1155: "${addresses.UsageRights1155}",
  PartyBackpack: "${addresses.PartyBackpack}",
  RecipeRegistry: "${addresses.RecipeRegistry}",
  RentalEscrow: "${addresses.RentalEscrow}"
} as const;

export const CHAIN_CONFIG = {
  chainId: 300,
  rpcUrl: "https://sepolia.era.zksync.dev"
} as const;
`;

  const frontendPath = path.join(__dirname, "../../frontend/src/lib/addresses.ts");
  fs.writeFileSync(frontendPath, addressesContent);
  console.log("✅ Updated frontend addresses");

  console.log("\n🎉 Done!");
}

main().catch(console.error);


