const { ethers } = require('ethers');

async function main() {
  console.log('📝 Registering recipes in NEW RecipeRegistry...\n');
  
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
    'function registerRecipe(tuple(address token, uint256 id, uint256 amount)[] inputs, address outputToken, uint256 outputId, uint256 outputAmount) external',
    'function getRecipeCount() view returns (uint256)'
  ];
  
  const recipeRegistry = new ethers.Contract(recipeRegistryAddress, recipeAbi, wallet);
  
  // Check owner
  const owner = await recipeRegistry.owner();
  console.log('RecipeRegistry owner:', owner);
  
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.log('❌ You are not the owner!');
    return;
  }
  
  console.log('✅ You are owner, registering recipes...\n');
  
  try {
    // Recipe 1: 3 Herb + 1 Shield → Blessed Shield
    console.log('📝 [1/3] Registering: 3 Herb + 1 Shield → Blessed Shield...');
    const tx1 = await recipeRegistry.registerRecipe(
      [
        { token: usageRightsAddress, id: 3, amount: 3 }, // 3 Herb
        { token: usageRightsAddress, id: 2, amount: 1 }  // 1 Shield
      ],
      usageRightsAddress,
      42, // Blessed Shield
      1
    );
    await tx1.wait();
    console.log('✅ Recipe 1 registered! TX:', tx1.hash);
    console.log();
    
    // Recipe 2: 5 Herb + 2 Potion → Super Potion
    console.log('📝 [2/3] Registering: 5 Herb + 2 Potion → Super Potion...');
    const tx2 = await recipeRegistry.registerRecipe(
      [
        { token: usageRightsAddress, id: 3, amount: 5 }, // 5 Herb
        { token: usageRightsAddress, id: 4, amount: 2 }  // 2 Potion
      ],
      usageRightsAddress,
      43, // Super Potion
      1
    );
    await tx2.wait();
    console.log('✅ Recipe 2 registered! TX:', tx2.hash);
    console.log();
    
    // Recipe 3: 1 Sword + 2 Herb → Enchanted Sword
    console.log('📝 [3/3] Registering: 1 Sword + 2 Herb → Enchanted Sword...');
    const tx3 = await recipeRegistry.registerRecipe(
      [
        { token: usageRightsAddress, id: 1, amount: 1 }, // 1 Sword
        { token: usageRightsAddress, id: 3, amount: 2 }  // 2 Herb
      ],
      usageRightsAddress,
      44, // Enchanted Sword
      1
    );
    await tx3.wait();
    console.log('✅ Recipe 3 registered! TX:', tx3.hash);
    console.log();
    
    // Check count
    const count = await recipeRegistry.getRecipeCount();
    console.log('🎊 ALL RECIPES REGISTERED!');
    console.log('📊 Total recipes:', count.toString());
    console.log();
    console.log('✅ Теперь крафтинг должен отображаться в frontend!');
    
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

