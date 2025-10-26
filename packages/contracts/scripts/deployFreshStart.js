const { Wallet, Provider } = require("zksync-ethers");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 FRESH START: Deploying ALL contracts with adminMint fix...\n');
  
  const privateKey = "cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const rpcUrl = "https://sepolia.era.zksync.dev";
  
  const provider = new Provider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);
  
  console.log('👤 Deployer:', wallet.address);
  
  const balance = await wallet.getBalance();
  console.log('💰 Balance:', balance.toString(), 'wei\n');
  
  const hre = require("hardhat");
  const deployer = new Deployer(hre, wallet);
  
  const addresses = {};
  
  try {
    // 1. Deploy UsageRights1155
    console.log('📦 [1/2] Deploying UsageRights1155...');
    const usageRightsArtifact = await deployer.loadArtifact("UsageRights1155");
    const usageRightsContract = await deployer.deploy(usageRightsArtifact, ["https://api.backpackguilds.com/metadata/"]);
    await usageRightsContract.waitForDeployment();
    
    addresses.UsageRights1155 = await usageRightsContract.getAddress();
    console.log('✅ UsageRights1155:', addresses.UsageRights1155);
    console.log();
    
    // 2. Deploy RecipeRegistry with adminMint
    console.log('📦 [2/2] Deploying RecipeRegistry (with adminMint)...');
    const recipeArtifact = await deployer.loadArtifact("RecipeRegistry");
    const recipeContract = await deployer.deploy(recipeArtifact, [addresses.UsageRights1155]);
    await recipeContract.waitForDeployment();
    
    addresses.RecipeRegistry = await recipeContract.getAddress();
    console.log('✅ RecipeRegistry:', addresses.RecipeRegistry);
    console.log();
    
    // 3. Transfer ownership UsageRights1155 -> RecipeRegistry
    console.log('🔧 [3/3] Transferring ownership...');
    const tx = await usageRightsContract.transferOwnership(addresses.RecipeRegistry);
    await tx.wait();
    console.log('✅ Ownership transferred!');
    console.log();
    
    // 4. Update frontend addresses
    const addressesPath = path.join(__dirname, '../../frontend/src/lib/addresses.ts');
    const addressesContent = `// Auto-generated contract addresses
// This file is updated after deployment

export const CONTRACT_ADDRESSES = {
  UsageRights1155: "${addresses.UsageRights1155}",
  PartyBackpack: "0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9",
  RecipeRegistry: "${addresses.RecipeRegistry}",
  RentalEscrow: "0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159"
} as const;

export const CHAIN_CONFIG = {
  chainId: 300,
  rpcUrl: "https://sepolia.era.zksync.dev"
} as const;
`;
    
    fs.writeFileSync(addressesPath, addressesContent);
    console.log('✅ Updated frontend addresses.ts');
    console.log();
    
    console.log('🎊 DEPLOYMENT COMPLETE!');
    console.log();
    console.log('🔗 NEW Addresses:');
    console.log('   UsageRights1155:', addresses.UsageRights1155);
    console.log('   RecipeRegistry:', addresses.RecipeRegistry);
    console.log();
    console.log('✅ RecipeRegistry can now adminMint!');
    console.log('✅ Ownership configured correctly');
    console.log();
    console.log('📋 NEXT STEPS:');
    console.log('   1. Test adminMint:');
    console.log('      node scripts/testAdminMint.js');
    console.log('   2. Register recipes');
    console.log('   3. Mint some test items');
    console.log('   4. Test frontend');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

