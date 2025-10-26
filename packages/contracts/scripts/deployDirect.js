const { Wallet, Provider } = require("zksync-ethers");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to zkSync Sepolia...\n");

  // Initialize provider
  const provider = new Provider("https://sepolia.era.zksync.dev");
  
  // Initialize wallet with hardcoded private key
  const privateKey = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const wallet = new Wallet(privateKey, provider);
  console.log(`📝 Deploying from: ${wallet.address}`);
  
  // Check balance
  const balance = await wallet.getBalance();
  console.log(`💰 Balance: ${balance.toString()} wei\n`);
  
  if (balance.toString() === "0") {
    console.log("❌ No ETH in wallet!");
    console.log("🔗 Get testnet ETH from: https://sepolia.faucet.zksync.io");
    console.log(`📋 Your address: ${wallet.address}\n`);
    process.exit(1);
  }

  // Initialize deployer
  const deployer = new Deployer(hre, wallet);

  const addresses = {};

  try {
    // Deploy ReputationSystem first
    console.log("📦 Deploying ReputationSystem...");
    const reputationArtifact = await deployer.loadArtifact("ReputationSystem");
    const reputationSystem = await deployer.deploy(reputationArtifact);
    await reputationSystem.waitForDeployment();
    addresses.ReputationSystem = await reputationSystem.getAddress();
    console.log(`✅ ReputationSystem deployed to: ${addresses.ReputationSystem}\n`);

    // Deploy UsageRights1155
    console.log("📦 Deploying UsageRights1155...");
    const usageRightsArtifact = await deployer.loadArtifact("UsageRights1155");
    const usageRights = await deployer.deploy(usageRightsArtifact, [
      "https://api.backpackguilds.com/metadata/{id}.json",
      addresses.ReputationSystem
    ]);
    await usageRights.waitForDeployment();
    addresses.UsageRights1155 = await usageRights.getAddress();
    console.log(`✅ UsageRights1155 deployed to: ${addresses.UsageRights1155}\n`);

    // Deploy PartyBackpack
    console.log("📦 Deploying PartyBackpack...");
    const partyBackpackArtifact = await deployer.loadArtifact("PartyBackpack");
    const partyBackpack = await deployer.deploy(partyBackpackArtifact, [addresses.UsageRights1155]);
    await partyBackpack.waitForDeployment();
    addresses.PartyBackpack = await partyBackpack.getAddress();
    console.log(`✅ PartyBackpack deployed to: ${addresses.PartyBackpack}\n`);

    // Deploy RecipeRegistry
    console.log("📦 Deploying RecipeRegistry...");
    const recipeRegistryArtifact = await deployer.loadArtifact("RecipeRegistry");
    const recipeRegistry = await deployer.deploy(recipeRegistryArtifact);
    await recipeRegistry.waitForDeployment();
    addresses.RecipeRegistry = await recipeRegistry.getAddress();
    console.log(`✅ RecipeRegistry deployed to: ${addresses.RecipeRegistry}\n`);

    // Deploy RentalEscrow
    console.log("📦 Deploying RentalEscrow...");
    const rentalEscrowArtifact = await deployer.loadArtifact("RentalEscrow");
    const rentalEscrow = await deployer.deploy(rentalEscrowArtifact, [addresses.UsageRights1155]);
    await rentalEscrow.waitForDeployment();
    addresses.RentalEscrow = await rentalEscrow.getAddress();
    console.log(`✅ RentalEscrow deployed to: ${addresses.RentalEscrow}\n`);

    // Save addresses
    console.log("💾 Saving contract addresses...");
    
    // Save to contracts/scripts/addresses.ts
    const contractsAddressesPath = path.join(__dirname, "addresses.ts");
    const contractsAddressesContent = `// Auto-generated contract addresses
// This file is updated after deployment

export const CONTRACT_ADDRESSES = {
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
    fs.writeFileSync(contractsAddressesPath, contractsAddressesContent);
    console.log(`✅ Saved to: ${contractsAddressesPath}`);

    // Save to frontend/src/lib/addresses.ts
    const frontendAddressesPath = path.join(__dirname, "../frontend/src/lib/addresses.ts");
    fs.writeFileSync(frontendAddressesPath, contractsAddressesContent);
    console.log(`✅ Saved to: ${frontendAddressesPath}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log(JSON.stringify(addresses, null, 2));
    console.log("\n🔗 View on Block Explorer:");
    console.log(`https://sepolia.explorer.zksync.io/address/${addresses.UsageRights1155}`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
