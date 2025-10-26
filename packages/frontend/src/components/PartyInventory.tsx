'use client';

import { useState, useEffect } from 'react';
import { useParty } from '@/hooks/useParty';
import { useBackpack } from '@/hooks/useBackpack';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const DEMO_TOKENS = [
  { id: BigInt(1), name: 'Sword', description: 'A sharp blade for combat' },
  { id: BigInt(2), name: 'Shield', description: 'Protection from enemy attacks' },
  { id: BigInt(3), name: 'Herb', description: 'Healing plant for crafting' },
];

export function PartyInventory() {
  const { getPartyBalance, getActiveUsers, deposit, grantUsage, reclaim } = useParty();
  const { getBalance } = useBackpack();
  const [depositing, setDepositing] = useState<bigint | null>(null);
  const [granting, setGranting] = useState<bigint | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [expires, setExpires] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleDeposit = async (tokenId: bigint) => {
    if (!amount) return;
    
    setDepositing(tokenId);
    try {
      await deposit(tokenId, BigInt(amount));
      setAmount('');
    } catch (error) {
      console.error('Error depositing:', error);
    } finally {
      setDepositing(null);
    }
  };

  const handleGrantUsage = async (tokenId: bigint) => {
    if (!userAddress || !amount || !expires) return;
    
    setGranting(tokenId);
    try {
      const expiresTimestamp = Math.floor(Date.now() / 1000) + parseInt(expires) * 3600;
      await grantUsage(userAddress, tokenId, BigInt(amount), BigInt(expiresTimestamp));
      setUserAddress('');
      setAmount('');
      setExpires('');
    } catch (error) {
      console.error('Error granting usage:', error);
    } finally {
      setGranting(null);
    }
  };

  const handleReclaim = async (tokenId: bigint) => {
    if (!amount) return;
    
    try {
      await reclaim(tokenId, BigInt(amount));
      setAmount('');
    } catch (error) {
      console.error('Error reclaiming:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Party Inventory</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_TOKENS.map((token) => {
          const { data: balance } = getBalance(token.id);
          const { data: partyBalance } = getPartyBalance(token.id);
          const { data: activeUsers } = getActiveUsers(token.id);
          
          return (
            <Card key={token.id.toString()} title={token.name}>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{token.description}</p>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">My Balance:</span> {isHydrated ? (balance?.toString() || '0') : '0'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Party Balance:</span> {isHydrated ? (partyBalance?.toString() || '0') : '0'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Active Users:</span> {isHydrated ? (activeUsers?.toString() || '0') : '0'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900">Deposit to Party</h4>
                    <div className="mt-2 flex space-x-2">
                      <Input
                        placeholder="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleDeposit(token.id)}
                        loading={depositing === token.id}
                        disabled={!amount}
                        size="sm"
                      >
                        Deposit
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900">Grant Usage</h4>
                    <div className="mt-2 space-y-2">
                      <Input
                        label="To Address"
                        placeholder="0x..."
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
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
                          Grant
                        </Button>
                        
                        <Button
                          onClick={() => handleReclaim(token.id)}
                          variant="outline"
                          size="sm"
                        >
                          Reclaim
                        </Button>
                      </div>
                    </div>
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
