const { ethers } = require("hardhat");

async function main() {
  console.log('🎮 Quick Mint - Getting test items...');
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log('Using account:', deployer.address);
    
    // Get contract addresses
    const addresses = require('./addresses.ts');
    const CONTRACT_ADDRESSES = addresses.CONTRACT_ADDRESSES;
    
    // Get the UsageRights1155 contract
    const usageRights = await ethers.getContractAt("UsageRights1155", CONTRACT_ADDRESSES.UsageRights1155);
    
    console.log('📦 Minting items to your wallet...');
    
    // Mint items to deployer
    await usageRights.mint(deployer.address, 1, 50, "0x"); // 50 Swords
    console.log('✅ Minted 50 Swords (ID: 1)');
    
    await usageRights.mint(deployer.address, 2, 25, "0x"); // 25 Shields
    console.log('✅ Minted 25 Shields (ID: 2)');
    
    await usageRights.mint(deployer.address, 3, 100, "0x"); // 100 Herbs
    console.log('✅ Minted 100 Herbs (ID: 3)');
    
    await usageRights.mint(deployer.address, 4, 10, "0x"); // 10 Potions
    console.log('✅ Minted 10 Potions (ID: 4)');
    
    console.log('🎉 Items minted successfully!');
    console.log('📊 Your inventory:');
    console.log('   - 50 Swords');
    console.log('   - 25 Shields');
    console.log('   - 100 Herbs');
    console.log('   - 10 Potions');
    
    console.log('\n💡 Now you can:');
    console.log('   1. Open the frontend at http://localhost:3000');
    console.log('   2. Connect your wallet');
    console.log('   3. Go to Backpack to see your items');
    console.log('   4. Test all the game features!');
    
  } catch (error) {
    console.error('❌ Minting failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
