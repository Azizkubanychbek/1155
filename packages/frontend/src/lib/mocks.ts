// Mock data for development without deployed contracts
export const MOCK_TOKENS = [
  { id: BigInt(1), name: 'Sword', description: 'A sharp blade for combat', balance: 5 },
  { id: BigInt(2), name: 'Shield', description: 'Protection from enemy attacks', balance: 3 },
  { id: BigInt(3), name: 'Herb', description: 'Healing plant for crafting', balance: 10 },
  { id: BigInt(4), name: 'Potion', description: 'Magical healing potion', balance: 2 },
];

export const MOCK_RECIPES = [
  {
    id: 1,
    name: 'Blessed Shield',
    description: 'A shield blessed with healing herbs',
    inputs: [
      { token: '0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1', id: BigInt(2), amount: 1 },
      { token: '0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1', id: BigInt(3), amount: 3 }
    ],
    output: { token: '0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1', id: BigInt(42), amount: 1 }
  }
];

export const MOCK_PARTY_MEMBERS = [
  { address: '0xB468B3837e185B59594A100c1583a98C79b524F3', name: 'Guild Leader', role: 'Leader' },
  { address: '0x1234567890123456789012345678901234567890', name: 'Warrior', role: 'Member' },
  { address: '0x0987654321098765432109876543210987654321', name: 'Mage', role: 'Member' }
];

export const MOCK_RENTALS = [
  {
    id: 1,
    lender: '0xB468B3837e185B59594A100c1583a98C79b524F3',
    borrower: '0x1234567890123456789012345678901234567890',
    tokenId: BigInt(1),
    amount: 1,
    expires: Date.now() + 3600000, // 1 hour
    deposit: '0.1',
    status: 'active'
  }
];

// Mock functions for development
export const mockContractCall = async (functionName: string, args?: any[]) => {
  console.log(`Mock contract call: ${functionName}`, args);
  
  switch (functionName) {
    case 'balanceOf':
      return BigInt(Math.floor(Math.random() * 10));
    case 'userOf':
      return ['0x0000000000000000000000000000000000000000', BigInt(0), BigInt(0)];
    case 'isUserActive':
      return false;
    case 'getPartyBalance':
      return BigInt(Math.floor(Math.random() * 5));
    case 'getActiveUsers':
      return [];
    case 'getRecipes':
      return MOCK_RECIPES;
    default:
      return null;
  }
};

export const mockWriteContract = async (functionName: string, args?: any[]) => {
  console.log(`Mock write contract: ${functionName}`, args);
  
  // Simulate transaction delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    hash: '0x' + Math.random().toString(16).substr(2, 64),
    wait: async () => ({ status: 1 })
  };
};
