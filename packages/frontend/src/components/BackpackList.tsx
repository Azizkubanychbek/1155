'use client';

import { useState, useEffect } from 'react';
import { useBackpack } from '@/hooks/useBackpack';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const DEMO_TOKENS = [
  { id: 1n, name: 'Sword', description: 'A sharp blade for combat' },
  { id: 2n, name: 'Shield', description: 'Protection from enemy attacks' },
  { id: 3n, name: 'Herb', description: 'Healing plant for crafting' },
];

export function BackpackList() {
  const { getBalance, setUser, revokeUser } = useBackpack();
  const [granting, setGranting] = useState<bigint | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [expires, setExpires] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleGrantUsage = async (tokenId: bigint) => {
    if (!userAddress || !amount || !expires) return;
    
    setGranting(tokenId);
    try {
      const expiresTimestamp = Math.floor(Date.now() / 1000) + parseInt(expires) * 3600;
      await setUser(tokenId, userAddress, BigInt(amount), BigInt(expiresTimestamp));
      setUserAddress('');
      setAmount('');
      setExpires('');
    } catch (error) {
      console.error('Error granting usage:', error);
    } finally {
      setGranting(null);
    }
  };

  const handleRevokeUsage = async (tokenId: bigint) => {
    try {
      await revokeUser(tokenId, userAddress);
    } catch (error) {
      console.error('Error revoking usage:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Backpack</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_TOKENS.map((token) => {
          const { data: balance, isLoading } = getBalance(token.id);
          
          return (
            <Card key={token.id.toString()} title={token.name}>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{token.description}</p>
                
                <div className="text-lg font-semibold">
                  Balance: {isHydrated ? (isLoading ? '...' : (balance?.toString() || '0')) : '0'}
                </div>

                <div className="space-y-3">
                  <Input
                    label="Grant to Address"
                    placeholder="0x..."
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Amount"
                      type="number"
                      placeholder="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    
                    <Input
                      label="Hours"
                      type="number"
                      placeholder="24"
                      value={expires}
                      onChange={(e) => setExpires(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleGrantUsage(token.id)}
                      loading={granting === token.id}
                      disabled={!userAddress || !amount || !expires}
                      size="sm"
                    >
                      Grant Usage
                    </Button>
                    
                    <Button
                      onClick={() => handleRevokeUsage(token.id)}
                      variant="outline"
                      size="sm"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
