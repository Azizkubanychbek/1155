const fs = require('fs');
const path = require('path');

// Read deployment files to get addresses
const deploymentsDir = path.join(__dirname, 'deployments-zk', 'zkSyncSepolia', 'contracts');

function getContractAddress(contractName) {
  try {
    const filePath = path.join(deploymentsDir, `${contractName}.sol`, `${contractName}.json`);
    if (fs.existsSync(filePath)) {
      const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return deployment.entries[0].address;
    }
  } catch (error) {
    console.error(`Error reading ${contractName}:`, error.message);
  }
  return null;
}

// Get all contract addresses
const usageRightsAddress = getContractAddress('UsageRights1155');
const partyBackpackAddress = getContractAddress('PartyBackpack');
const recipeRegistryAddress = getContractAddress('RecipeRegistry');
const rentalEscrowAddress = getContractAddress('RentalEscrow');

console.log('📋 Contract Addresses:');
console.log('UsageRights1155:', usageRightsAddress || 'Not deployed');
console.log('PartyBackpack:', partyBackpackAddress || 'Not deployed');
console.log('RecipeRegistry:', recipeRegistryAddress || 'Not deployed');
console.log('RentalEscrow:', rentalEscrowAddress || 'Not deployed');

// Generate frontend .env.local content
const frontendEnv = `NEXT_PUBLIC_ZKSYNC_RPC=https://sepolia.era.zksync.dev
NEXT_PUBLIC_CHAIN_ID=300
NEXT_PUBLIC_USAGE_RIGHTS_ADDRESS=${usageRightsAddress || ''}
NEXT_PUBLIC_PARTY_BACKPACK_ADDRESS=${partyBackpackAddress || ''}
NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS=${recipeRegistryAddress || ''}
NEXT_PUBLIC_RENTAL_ESCROW_ADDRESS=${rentalEscrowAddress || ''}
`;

console.log('\n📝 Frontend .env.local content:');
console.log(frontendEnv);

// Write to frontend .env.local
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');
fs.writeFileSync(frontendEnvPath, frontendEnv);
console.log('\n✅ Updated frontend/.env.local');
