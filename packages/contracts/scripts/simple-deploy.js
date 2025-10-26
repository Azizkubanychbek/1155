const { Wallet, Provider } = require("zksync-ethers");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting simple deployment...');
  
  // Configuration
  const privateKey = "cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const rpcUrl = "https://sepolia.era.zksync.dev";
  
  // Create provider and wallet
  const provider = new Provider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);
  
  console.log('Wallet address:', wallet.address);
  
  // Create deployer
  const deployer = new Deployer(hre, wallet);
  
  const addresses = {};
  
  try {
    // Deploy UsageRights1155
    console.log('\n📦 Deploying UsageRights1155...');
    const usageRightsArtifact = await deployer.loadArtifact("UsageRights1155");
    const usageRightsContract = await deployer.deploy(usageRightsArtifact, ["https://api.backpackguilds.com/metadata/"]);
    addresses.UsageRights1155 = usageRightsContract.address;
    console.log('✅ UsageRights1155 deployed to:', usageRightsContract.address);
    
    // Mint demo tokens
    console.log('🎯 Minting demo tokens...');
    await usageRightsContract.mint(wallet.address, 1, 100, "0x");
    await usageRightsContract.mint(wallet.address, 2, 50, "0x");
    await usageRightsContract.mint(wallet.address, 3, 200, "0x");
    console.log('✅ Demo tokens minted');
    
    // Deploy PartyBackpack
    console.log('\n📦 Deploying PartyBackpack...');
    const partyBackpackArtifact = await deployer.loadArtifact("PartyBackpack");
    const partyBackpackContract = await deployer.deploy(partyBackpackArtifact, [usageRightsContract.address]);
    addresses.PartyBackpack = partyBackpackContract.address;
    console.log('✅ PartyBackpack deployed to:', partyBackpackContract.address);
    
    // Deploy RecipeRegistry
    console.log('\n📦 Deploying RecipeRegistry...');
    const recipeRegistryArtifact = await deployer.loadArtifact("RecipeRegistry");
    const recipeRegistryContract = await deployer.deploy(recipeRegistryArtifact, []);
    addresses.RecipeRegistry = recipeRegistryContract.address;
    console.log('✅ RecipeRegistry deployed to:', recipeRegistryContract.address);
    
    // Deploy RentalEscrow
    console.log('\n📦 Deploying RentalEscrow...');
    const rentalEscrowArtifact = await deployer.loadArtifact("RentalEscrow");
    const rentalEscrowContract = await deployer.deploy(rentalEscrowArtifact, []);
    addresses.RentalEscrow = rentalEscrowContract.address;
    console.log('✅ RentalEscrow deployed to:', rentalEscrowContract.address);
    
    // Save addresses
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