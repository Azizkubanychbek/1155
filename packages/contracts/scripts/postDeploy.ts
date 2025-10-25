import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Читаем адреса из deployment artifacts
function getDeployedAddresses() {
  const artifactsPath = join(__dirname, '../artifacts');
  
  // В реальном проекте здесь бы читались адреса из deployment artifacts
  // Для демо используем переменные окружения
  const addresses = {
    UsageRights1155: process.env.USAGE_RIGHTS_ADDRESS || "0x0000000000000000000000000000000000000000",
    PartyBackpack: process.env.PARTY_BACKPACK_ADDRESS || "0x0000000000000000000000000000000000000000",
    RecipeRegistry: process.env.RECIPE_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
    RentalEscrow: process.env.RENTAL_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000"
  };

  return addresses;
}

// Генерируем addresses.ts для контрактов
function generateContractsAddresses(addresses: any) {
  const contractsContent = `// Auto-generated contract addresses
// This file is updated after deployment

export const CONTRACT_ADDRESSES = {
  UsageRights1155: "${addresses.UsageRights1155}",
  PartyBackpack: "${addresses.PartyBackpack}", 
  RecipeRegistry: "${addresses.RecipeRegistry}",
  RentalEscrow: "${addresses.RentalEscrow}"
} as const;

export const CHAIN_CONFIG = {
  chainId: Number(process.env.XSOLLA_ZK_CHAIN_ID) || 0,
  rpcUrl: process.env.XSOLLA_ZK_SEPOLIA_RPC || ""
} as const;
`;

  const contractsPath = join(__dirname, 'addresses.ts');
  writeFileSync(contractsPath, contractsContent);
  console.log('✅ Generated packages/contracts/scripts/addresses.ts');
}

// Генерируем addresses.ts для фронтенда
function generateFrontendAddresses(addresses: any) {
  const frontendContent = `// Auto-generated contract addresses
// This file is updated after deployment

export const CONTRACT_ADDRESSES = {
  UsageRights1155: "${addresses.UsageRights1155}",
  PartyBackpack: "${addresses.PartyBackpack}", 
  RecipeRegistry: "${addresses.RecipeRegistry}",
  RentalEscrow: "${addresses.RentalEscrow}"
} as const;

export const CHAIN_CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 0,
  rpcUrl: process.env.NEXT_PUBLIC_XSOLLA_ZK_RPC || ""
} as const;
`;

  const frontendPath = join(__dirname, '../../frontend/src/lib/addresses.ts');
  writeFileSync(frontendPath, frontendContent);
  console.log('✅ Generated packages/frontend/src/lib/addresses.ts');
}

// Основная функция
async function main() {
  console.log('🔄 Post-deployment script starting...');
  
  try {
    const addresses = getDeployedAddresses();
    
    // Проверяем, что все адреса получены
    const missingAddresses = Object.entries(addresses)
      .filter(([_, address]) => address === "0x0000000000000000000000000000000000000000")
      .map(([name, _]) => name);
    
    if (missingAddresses.length > 0) {
      console.warn(`⚠️  Missing addresses: ${missingAddresses.join(', ')}`);
      console.warn('   Please set environment variables or update this script to read from deployment artifacts');
    }
    
    // Генерируем файлы адресов
    generateContractsAddresses(addresses);
    generateFrontendAddresses(addresses);
    
    console.log('✅ Post-deployment script completed successfully!');
    console.log('📋 Contract addresses:');
    Object.entries(addresses).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    
  } catch (error) {
    console.error('❌ Post-deployment script failed:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

