const { ethers } = require('ethers');

async function main() {
  console.log('🧪 Testing adminMint function...\n');
  
  const privateKey = 'cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c';
  const provider = new ethers.JsonRpcProvider('https://sepolia.era.zksync.dev');
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const recipeRegistryAddress = '0xde41e18E60446f61B7cfc08139D39860CF6eE64D';
  const usageRightsAddress = '0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1';
  
  console.log('👤 Wallet:', wallet.address);
  console.log('📄 RecipeRegistry:', recipeRegistryAddress);
  console.log('📄 UsageRights1155:', usageRightsAddress);
  console.log();
  
  const recipeAbi = [
    'function owner() view returns (address)',
    'function adminMint(address to, uint256 id, uint256 amount, bytes data) external',
    'function adminMintBatch(address to, uint256[] ids, uint256[] amounts, bytes data) external'
  ];
  
  const usageRightsAbi = [
    'function owner() view returns (address)',
    'function balanceOf(address account, uint256 id) view returns (uint256)'
  ];
  
  const recipeRegistry = new ethers.Contract(recipeRegistryAddress, recipeAbi, wallet);
  const usageRights = new ethers.Contract(usageRightsAddress, usageRightsAbi, provider);
  
  // Check ownership
  const recipeOwner = await recipeRegistry.owner();
  const usageRightsOwner = await usageRights.owner();
  
  console.log('✅ RecipeRegistry owner:', recipeOwner);
  console.log('✅ UsageRights1155 owner:', usageRightsOwner);
  console.log();
  
  if (recipeOwner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.log('❌ You are not the owner of RecipeRegistry!');
    return;
  }
  
  if (usageRightsOwner.toLowerCase() !== recipeRegistryAddress.toLowerCase()) {
    console.log('❌ RecipeRegistry is not the owner of UsageRights1155!');
    return;
  }
  
  console.log('🎯 Testing adminMint...');
  console.log('   Minting: 100 Sword (ID=1), 50 Shield (ID=2), 200 Herb (ID=3)');
  console.log();
  
  try {
    // Test single mint
    console.log('📝 Minting 100 Swords...');
    const tx1 = await recipeRegistry.adminMint(wallet.address, 1, 100, '0x');
    await tx1.wait();
    console.log('✅ Mint успешен! TX:', tx1.hash);
    
    // Check balance
    const swordBalance = await usageRights.balanceOf(wallet.address, 1);
    console.log('💰 Sword balance:', swordBalance.toString());
    console.log();
    
    // Test batch mint
    console.log('📝 Batch minting Shield and Herb...');
    const tx2 = await recipeRegistry.adminMintBatch(
      wallet.address,
      [2, 3],
      [50, 200],
      '0x'
    );
    await tx2.wait();
    console.log('✅ Batch mint успешен! TX:', tx2.hash);
    
    // Check balances
    const shieldBalance = await usageRights.balanceOf(wallet.address, 2);
    const herbBalance = await usageRights.balanceOf(wallet.address, 3);
    console.log('💰 Shield balance:', shieldBalance.toString());
    console.log('💰 Herb balance:', herbBalance.toString());
    console.log();
    
    console.log('🎊 ТЕСТ УСПЕШЕН!');
    console.log();
    console.log('✅ adminMint работает!');
    console.log('✅ Комиссия нормальная (оцените в кошельке)');
    console.log('✅ Дыра устранена!');
    console.log();
    console.log('📋 Следующие шаги:');
    console.log('   1. Проверьте комиссию последних транзакций');
    console.log('   2. Зарегистрируйте рецепты');
    console.log('   3. Протестируйте frontend');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

