'use client';

import { useState, useEffect } from 'react';
import { useCraft } from '@/hooks/useCraft';
import { useBackpack } from '@/hooks/useBackpack';
import { useAccount, useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ApproveButton } from './ApproveButton';

export function CraftPanel() {
  const { getAllRecipes, craft, getFormattedRecipes } = useCraft();
  const { getBalance } = useBackpack();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [crafting, setCrafting] = useState<bigint | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [craftTxHash, setCraftTxHash] = useState<`0x${string}` | undefined>();

  const { data: recipesData, isLoading, error } = getAllRecipes();
  const recipes = getFormattedRecipes();

  // Wait for craft transaction to complete
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: craftTxHash,
  });

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show success message and refetch balances after craft confirmation
  useEffect(() => {
    if (isConfirmed && crafting !== null) {
      const recipe = recipes.find(r => r.id === crafting);
      if (recipe) {
        alert(`✅ Успешно скрафчено: ${recipe.output.amount} ${recipe.output.name}!\n\nПроверьте свой инвентарь (Backpack).`);
      }
      setCrafting(null);
      setCraftTxHash(undefined);
      
      // Refetch balances will happen automatically due to wagmi polling
    }
  }, [isConfirmed, crafting, recipes]);

  // Debug logging
  console.log('CraftPanel Debug:', {
    address,
    isConnected,
    chainId,
    recipesData,
    isLoading,
    error,
    recipes,
    recipesLength: recipes.length,
    crafting,
    isConfirming,
    isConfirmed,
  });

  const handleCraft = async (recipeId: bigint) => {
    if (!address) {
      console.error('No wallet address');
      return;
    }
    
    setCrafting(recipeId);
    try {
      console.log('🎯 Crafting with address:', address);
      const hash = await craft(recipeId, address);
      setCraftTxHash(hash);
      console.log('✅ Craft transaction sent:', hash);
    } catch (error) {
      console.error('Error crafting:', error);
      alert('❌ Ошибка при крафте. Проверьте консоль.');
      setCrafting(null);
      setCraftTxHash(undefined);
    }
  };

  const canCraft = (recipe: any) => {
    // Check if user has enough ingredients
    return recipe.inputs.every((input: any) => {
      const balance = getBalance(input.id);
      return balance.data && balance.data >= input.amount;
    });
  };

  // Show connection message if not connected or not hydrated
  if (!isHydrated || !isConnected) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Crafting Recipes</h2>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Please connect your wallet to view crafting recipes.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Crafting Recipes</h2>

      {/* Approve RecipeRegistry first */}
      <ApproveButton operator="RecipeRegistry" />

      <div className="grid gap-6 md:grid-cols-2">
        {recipes.map((recipe) => (
          <Card key={recipe.id.toString()} title={recipe.output.name}>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Recipe #{recipe.id.toString()}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Required Ingredients:</h4>
                <ul className="space-y-1">
                  {recipe.inputs.map((input: any, index: number) => {
                    const balance = getBalance(input.id);
                    const hasEnough = balance.data && balance.data >= input.amount;
                    
                    return (
                      <li key={index} className="flex justify-between text-sm">
                        <span className={hasEnough ? 'text-green-600' : 'text-red-600'}>
                          {input.amount} {input.name}
                        </span>
                        <span className="text-gray-500">
                          (You have: {isHydrated ? (balance.data?.toString() || '0') : '0'})
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Output:</h4>
                <div className="text-sm text-gray-600">
                  {recipe.output.amount} {recipe.output.name}
                </div>
              </div>
              
              <Button
                onClick={() => handleCraft(recipe.id)}
                loading={crafting === recipe.id || (isConfirming && crafting === recipe.id)}
                disabled={!canCraft(recipe) || !recipe.active || crafting !== null}
                className="w-full"
              >
                {crafting === recipe.id && isConfirming ? (
                  '⏳ Подтверждение...'
                ) : !recipe.active ? (
                  'Recipe Inactive'
                ) : canCraft(recipe) ? (
                  'Craft Item'
                ) : (
                  'Insufficient Materials'
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {recipes.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No recipes available yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Recipes will be added by the contract owner.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
