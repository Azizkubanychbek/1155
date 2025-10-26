'use client';

import { useState, useEffect } from 'react';
import { useBackpack } from '@/hooks/useBackpack';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const DEMO_TOKENS = [
  { id: BigInt(1), name: 'Sword', description: 'A sharp blade for combat' },
  { id: BigInt(2), name: 'Shield', description: 'Protection from enemy attacks' },
  { id: BigInt(3), name: 'Herb', description: 'Healing plant for crafting' },
];

// Тип для состояния формы по каждому токену
type TokenFormState = {
  userAddress: string;
  amount: string;
  expires: string;
};

export function BackpackList() {
  const { getBalance, setUser, revokeUser } = useBackpack();
  const [granting, setGranting] = useState<bigint | null>(null);
  
  // Отдельное состояние для каждого токена!
  const [formStates, setFormStates] = useState<Record<string, TokenFormState>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Получить состояние формы для конкретного токена
  const getFormState = (tokenId: bigint): TokenFormState => {
    return formStates[tokenId.toString()] || { userAddress: '', amount: '', expires: '' };
  };

  // Обновить состояние формы для конкретного токена
  const updateFormState = (tokenId: bigint, field: keyof TokenFormState, value: string) => {
    setFormStates(prev => ({
      ...prev,
      [tokenId.toString()]: {
        ...getFormState(tokenId),
        [field]: value,
      },
    }));
  };

  const handleGrantUsage = async (tokenId: bigint) => {
    const formState = getFormState(tokenId);
    if (!formState.userAddress || !formState.amount || !formState.expires) return;
    
    setGranting(tokenId);
    try {
      const expiresTimestamp = Math.floor(Date.now() / 1000) + parseInt(formState.expires) * 3600;
      await setUser(tokenId, formState.userAddress, BigInt(formState.amount), BigInt(expiresTimestamp));
      
      // Очистить форму только для этого токена
      setFormStates(prev => ({
        ...prev,
        [tokenId.toString()]: { userAddress: '', amount: '', expires: '' },
      }));
    } catch (error) {
      console.error('Error granting usage:', error);
    } finally {
      setGranting(null);
    }
  };

  const handleRevokeUsage = async (tokenId: bigint) => {
    const formState = getFormState(tokenId);
    if (!formState.userAddress) return;
    
    try {
      await revokeUser(tokenId, formState.userAddress);
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
          const formState = getFormState(token.id);
          
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
                    value={formState.userAddress}
                    onChange={(e) => updateFormState(token.id, 'userAddress', e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Amount"
                      type="number"
                      placeholder="1"
                      value={formState.amount}
                      onChange={(e) => updateFormState(token.id, 'amount', e.target.value)}
                    />
                    
                    <Input
                      label="Hours"
                      type="number"
                      placeholder="24"
                      value={formState.expires}
                      onChange={(e) => updateFormState(token.id, 'expires', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleGrantUsage(token.id)}
                      loading={granting === token.id}
                      disabled={!formState.userAddress || !formState.amount || !formState.expires}
                      size="sm"
                    >
                      Grant Usage
                    </Button>
                    
                    <Button
                      onClick={() => handleRevokeUsage(token.id)}
                      variant="outline"
                      size="sm"
                      disabled={!formState.userAddress}
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
