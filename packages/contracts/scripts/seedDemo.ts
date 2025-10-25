import { ethers } from "hardhat";
import { CONTRACT_ADDRESSES } from './addresses';

async function main() {
  console.log('🌱 Seeding demo data...');
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log('Deployer address:', deployer.address);
    
    // Получаем контракты
    const usageRights = await ethers.getContractAt("UsageRights1155", CONTRACT_ADDRESSES.UsageRights1155);
    const partyBackpack = await ethers.getContractAt("PartyBackpack", CONTRACT_ADDRESSES.PartyBackpack);
    const recipeRegistry = await ethers.getContractAt("RecipeRegistry", CONTRACT_ADDRESSES.RecipeRegistry);
    
    console.log('📦 Minting demo tokens...');
    
    // Минтим демо токены деплойеру
    await usageRights.mint(deployer.address, 1, 100, "0x"); // Sword
    console.log('✅ Minted 100 Swords (ID: 1)');
    
    await usageRights.mint(deployer.address, 2, 50, "0x"); // Shield  
    console.log('✅ Minted 50 Shields (ID: 2)');
    
    await usageRights.mint(deployer.address, 3, 200, "0x"); // Herb
    console.log('✅ Minted 200 Herbs (ID: 3)');
    
    console.log('📝 Registering crafting recipe...');
    
    // Регистрируем рецепт: 3x Herb + 1x Shield -> Blessed Shield (ID: 42)
    const ingredients = [
      {
        token: CONTRACT_ADDRESSES.UsageRights1155,
        id: 3, // Herb
        amount: 3
      },
      {
        token: CONTRACT_ADDRESSES.UsageRights1155,
        id: 2, // Shield
        amount: 1
      }
    ];
    
    await recipeRegistry.registerRecipe(
      ingredients,
      CONTRACT_ADDRESSES.UsageRights1155, // Output token
      42, // Blessed Shield ID
      1   // Output amount
    );
    console.log('✅ Registered recipe: 3x Herb + 1x Shield -> 1x Blessed Shield');
    
    console.log('🎒 Setting up party inventory...');
    
    // Одобряем PartyBackpack для траты токенов
    await usageRights.setApprovalForAll(CONTRACT_ADDRESSES.PartyBackpack, true);
    
    // Кладем часть предметов в PartyBackpack
    await partyBackpack.deposit(1, 20); // 20 Swords
    console.log('✅ Deposited 20 Swords to party inventory');
    
    await partyBackpack.deposit(2, 10); // 10 Shields
    console.log('✅ Deposited 10 Shields to party inventory');
    
    await partyBackpack.deposit(3, 50); // 50 Herbs
    console.log('✅ Deposited 50 Herbs to party inventory');
    
    console.log('👥 Granting usage rights...');
    
    // Создаем тестовый адрес (в реальном проекте это был бы адрес другого пользователя)
    const testUser = "0x1234567890123456789012345678901234567890"; // Placeholder адрес
    
    // Выдаем права использования на 30 минут
    const expires = Math.floor(Date.now() / 1000) + (30 * 60); // 30 минут
    
    await partyBackpack.grantUsage(testUser, 1, 5, expires); // 5 Swords
    console.log('✅ Granted 5 Swords usage to test user for 30 minutes');
    
    await partyBackpack.grantUsage(testUser, 2, 2, expires); // 2 Shields  
    console.log('✅ Granted 2 Shields usage to test user for 30 minutes');
    
    console.log('🎉 Demo data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Minted: 100 Swords, 50 Shields, 200 Herbs');
    console.log('   - Recipe: 3x Herb + 1x Shield -> Blessed Shield');
    console.log('   - Party inventory: 20 Swords, 10 Shields, 50 Herbs');
    console.log('   - Test user granted: 5 Swords, 2 Shields (30 min)');
    
  } catch (error) {
    console.error('❌ Demo seeding failed:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

