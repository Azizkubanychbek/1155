const hre = require("hardhat");

async function main() {
  console.log('🚀 Starting deployment...');
  
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  
  const addresses = {};
  
  try {
    // Deploy UsageRights1155
    console.log('\n📦 Deploying UsageRights1155...');
    const UsageRights1155 = await hre.ethers.getContractFactory("UsageRights1155");
    const usageRights = await UsageRights1155.deploy("https://api.backpackguilds.com/metadata/");
    await usageRights.waitForDeployment();
    addresses.UsageRights1155 = await usageRights.getAddress();
    console.log('✅ UsageRights1155 deployed to:', addresses.UsageRights1155);
    
    // Mint demo tokens
    console.log('🎯 Minting demo tokens...');
    await usageRights.mint(deployer.address, 1, 100, "0x");
    await usageRights.mint(deployer.address, 2, 50, "0x");
    await usageRights.mint(deployer.address, 3, 200, "0x");
    console.log('✅ Demo tokens minted');
    
    // Deploy PartyBackpack
    console.log('\n📦 Deploying PartyBackpack...');
    const PartyBackpack = await hre.ethers.getContractFactory("PartyBackpack");
    const partyBackpack = await PartyBackpack.deploy(addresses.UsageRights1155);
    await partyBackpack.waitForDeployment();
    addresses.PartyBackpack = await partyBackpack.getAddress();
    console.log('✅ PartyBackpack deployed to:', addresses.PartyBackpack);
    
    // Deploy RecipeRegistry
    console.log('\n📦 Deploying RecipeRegistry...');
    const RecipeRegistry = await hre.ethers.getContractFactory("RecipeRegistry");
    const recipeRegistry = await RecipeRegistry.deploy();
    await recipeRegistry.waitForDeployment();
    addresses.RecipeRegistry = await recipeRegistry.getAddress();
    console.log('✅ RecipeRegistry deployed to:', addresses.RecipeRegistry);
    
    // Deploy RentalEscrow
    console.log('\n📦 Deploying RentalEscrow...');
    const RentalEscrow = await hre.ethers.getContractFactory("RentalEscrow");
    const rentalEscrow = await RentalEscrow.deploy();
    await rentalEscrow.waitForDeployment();
    addresses.RentalEscrow = await rentalEscrow.getAddress();
    console.log('✅ RentalEscrow deployed to:', addresses.RentalEscrow);
    
    // Save addresses
    const fs = require('fs');
    const path = require('path');
    const addressesPath = path.join(__dirname, '..', 'addresses.json');
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log('\n💾 Addresses saved to addresses.json');
    
    // Update frontend .env.local
    const frontendEnvPath = path.join(__dirname, '..', '..', 'frontend', '.env.local');
    const frontendEnv = `NEXT_PUBLIC_ZKSYNC_RPC=https://sepolia.era.zksync.dev
NEXT_PUBLIC_CHAIN_ID=300
NEXT_PUBLIC_USAGE_RIGHTS_ADDRESS=${addresses.UsageRights1155}
NEXT_PUBLIC_PARTY_BACKPACK_ADDRESS=${addresses.PartyBackpack}
NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS=${addresses.RecipeRegistry}
NEXT_PUBLIC_RENTAL_ESCROW_ADDRESS=${addresses.RentalEscrow}
`;
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Updated frontend/.env.local');
    
    console.log('\n🎉 All contracts deployed successfully!');
    console.log('\n📋 Contract Addresses:');
    Object.entries(addresses).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
