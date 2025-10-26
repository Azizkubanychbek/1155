'use client';

import { useState, useEffect } from 'react';
import { useParty } from '@/hooks/useParty';
import { useBackpack } from '@/hooks/useBackpack';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ApproveButton } from './ApproveButton';

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

export function PartyInventory() {
  const { getPartyBalance, getActiveUsers, deposit, grantUsage, reclaim } = useParty();
  const { getBalance } = useBackpack();
  const [depositing, setDepositing] = useState<bigint | null>(null);
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

  const handleDeposit = async (tokenId: bigint) => {
    const formState = getFormState(tokenId);
    if (!formState.amount) return;
    
    setDepositing(tokenId);
    try {
      await deposit(tokenId, BigInt(formState.amount));
      // Очистить только amount для этого токена
      updateFormState(tokenId, 'amount', '');
    } catch (error) {
      console.error('Error depositing:', error);
    } finally {
      setDepositing(null);
    }
  };

  const handleGrantUsage = async (tokenId: bigint) => {
    const formState = getFormState(tokenId);
    if (!formState.userAddress || !formState.amount || !formState.expires) return;
    
    setGranting(tokenId);
    try {
      const expiresTimestamp = Math.floor(Date.now() / 1000) + parseInt(formState.expires) * 3600;
      await grantUsage(formState.userAddress, tokenId, BigInt(formState.amount), BigInt(expiresTimestamp));
      
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

  const handleReclaim = async (tokenId: bigint) => {
    const formState = getFormState(tokenId);
    if (!formState.amount) return;
    
    try {
      await reclaim(tokenId, BigInt(formState.amount));
      updateFormState(tokenId, 'amount', '');
    } catch (error) {
      console.error('Error reclaiming:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Party Inventory</h2>
      
      {/* Approve PartyBackpack first */}
      <ApproveButton operator="PartyBackpack" />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_TOKENS.map((token) => {
          const { data: balance } = getBalance(token.id);
          const { data: partyBalance } = getPartyBalance(token.id);
          const { data: activeUsers } = getActiveUsers(token.id);
          const formState = getFormState(token.id);
          
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
                    <h4 className="font-medium text-gray-900 mb-2">Deposit to Party</h4>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Amount"
                        type="number"
                        value={formState.amount}
                        onChange={(e) => updateFormState(token.id, 'amount', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleDeposit(token.id)}
                        loading={depositing === token.id}
                        disabled={!formState.amount}
                        size="sm"
                      >
                        Deposit
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Grant Usage</h4>
                    <div className="space-y-2">
                      <Input
                        label="To Address"
                        placeholder="0x..."
                        value={formState.userAddress}
                        onChange={(e) => updateFormState(token.id, 'userAddress', e.target.value)}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
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
                          Grant
                        </Button>
                        
                        <Button
                          onClick={() => handleReclaim(token.id)}
                          variant="outline"
                          size="sm"
                          disabled={!formState.amount}
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
