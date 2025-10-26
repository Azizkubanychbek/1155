'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { mockWriteContract } from '@/lib/mocks';

// RecipeRegistry ABI for adminMint (owner can mint through RecipeRegistry)
const RECIPE_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "bytes", "name": "data", "type": "bytes"}
    ],
    "name": "adminMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const DEMO_ITEMS = [
  { id: 1, name: 'Sword', amount: 10, description: 'Sharp blade for combat' },
  { id: 2, name: 'Shield', amount: 5, description: 'Protection from attacks' },
  { id: 3, name: 'Herb', amount: 20, description: 'Healing plant for crafting' },
  { id: 4, name: 'Potion', amount: 3, description: 'Magical healing potion' },
];

export function ItemFaucet() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [minting, setMinting] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  // Check if we're in development mode
  const isDevelopmentMode = !CONTRACT_ADDRESSES.UsageRights1155 || 
    CONTRACT_ADDRESSES.UsageRights1155 === '0x0000000000000000000000000000000000000000';

  const handleMint = async (itemId: number, amount: number) => {
    if (!address) return;
    
    setMinting(itemId);
    
    try {
      if (isDevelopmentMode) {
        // Use mock in development
        await mockWriteContract('mint', [address, itemId, amount, '0x']);
        alert(`✅ Minted ${amount} ${DEMO_ITEMS.find(item => item.id === itemId)?.name} (Mock Mode)`);
      } else {
        // ✅ ИСПРАВЛЕНО: Вызываем RecipeRegistry.adminMint() вместо прямого mint
        // RecipeRegistry владеет UsageRights1155 и может mint через adminMint
        await writeContract({
          address: CONTRACT_ADDRESSES.RecipeRegistry,
          abi: RECIPE_REGISTRY_ABI,
          functionName: 'adminMint',
          args: [address, BigInt(itemId), BigInt(amount), '0x'],
        });
        alert(`✅ Minted ${amount} ${DEMO_ITEMS.find(item => item.id === itemId)?.name}`);
      }
    } catch (error) {
      console.error('Minting failed:', error);
      alert('❌ Minting failed. Check console for details.');
    } finally {
      setMinting(null);
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">🎮 Item Faucet</h3>
        <p className="text-gray-600">Connect your wallet to get test items</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🎮 Item Faucet</h3>
      <p className="text-sm text-gray-600 mb-4">
        Get test items for development and testing
        {isDevelopmentMode && (
          <span className="block text-blue-600 font-medium">
            🔧 Development Mode - Using Mock Data
          </span>
        )}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_ITEMS.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <span className="text-sm font-medium text-green-600">
                +{item.amount}
              </span>
            </div>
            
            <Button
              onClick={() => handleMint(item.id, item.amount)}
              disabled={minting === item.id}
              className="w-full"
              variant="outline"
            >
              {minting === item.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Minting...
                </>
              ) : (
                `Get ${item.amount} ${item.name}`
              )}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ <strong>Fixed:</strong> Now using RecipeRegistry.adminMint() - normal gas fees!
        </p>
      </div>
    </Card>
  );
}
