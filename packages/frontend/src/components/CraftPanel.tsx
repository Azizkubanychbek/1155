'use client';

import { useState, useEffect } from 'react';
import { useCraft } from '@/hooks/useCraft';
import { useBackpack } from '@/hooks/useBackpack';
import { useAccount, useChainId } from 'wagmi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export function CraftPanel() {
  const { getAllRecipes, craft, getFormattedRecipes } = useCraft();
  const { getBalance } = useBackpack();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [crafting, setCrafting] = useState<bigint | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: recipesData, isLoading, error } = getAllRecipes();
  const recipes = getFormattedRecipes();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Debug logging
  console.log('CraftPanel Debug:', {
    address,
    isConnected,
    chainId,
    recipesData,
    isLoading,
    error,
    recipes,
    recipesLength: recipes.length
  });

  const handleCraft = async (recipeId: bigint) => {
    setCrafting(recipeId);
    try {
      await craft(recipeId, '0x0000000000000000000000000000000000000000'); // You'd use the actual user address
    } catch (error) {
      console.error('Error crafting:', error);
    } finally {
      setCrafting(null);
    }
  };

  const canCraft = (recipe: any) => {
    // Check if user has enough ingredients
    return recipe.inputs.every((input: any) => {
      const balance = getBalance(input.id);
      return balance.data && balance.data >= input.amount;
    });
  };

  // Show connection message if not connected
  if (!isConnected) {
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
                loading={crafting === recipe.id}
                disabled={!canCraft(recipe) || !recipe.active}
                className="w-full"
              >
                {!recipe.active ? 'Recipe Inactive' : canCraft(recipe) ? 'Craft Item' : 'Insufficient Materials'}
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
