import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { Recipe, CraftingRecipe } from '@/lib/types';

// RecipeRegistry ABI from artifacts
const RECIPE_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "crafter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "recipeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "outputToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "outputId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "outputAmount",
        "type": "uint256"
      }
    ],
    "name": "Crafted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "recipeId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct IRecipeRegistry.Ingredient[]",
        "name": "inputs",
        "type": "tuple[]"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "outputToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "outputId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "outputAmount",
        "type": "uint256"
      }
    ],
    "name": "RecipeAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "recipeId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "craft",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllRecipes",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct IRecipeRegistry.Ingredient[]",
            "name": "inputs",
            "type": "tuple[]"
          },
          {
            "internalType": "address",
            "name": "outputToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "outputId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct IRecipeRegistry.Recipe[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "recipeId",
        "type": "uint256"
      }
    ],
    "name": "getRecipe",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct IRecipeRegistry.Ingredient[]",
            "name": "inputs",
            "type": "tuple[]"
          },
          {
            "internalType": "address",
            "name": "outputToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "outputId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct IRecipeRegistry.Recipe",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRecipeCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct IRecipeRegistry.Ingredient[]",
        "name": "inputs",
        "type": "tuple[]"
      },
      {
        "internalType": "address",
        "name": "outputToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "outputId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outputAmount",
        "type": "uint256"
      }
    ],
    "name": "registerRecipe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "recipeId",
        "type": "uint256"
      }
    ],
    "name": "toggleRecipe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export function useCraft() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // Get all recipes
  const { data: recipes, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.RecipeRegistry,
    abi: RECIPE_REGISTRY_ABI,
    functionName: 'getAllRecipes',
  });

  // Get total recipe count
  const recipeCount = useReadContract({
    address: CONTRACT_ADDRESSES.RecipeRegistry,
    abi: RECIPE_REGISTRY_ABI,
    functionName: 'getRecipeCount',
  });

  // Helper function to get recipe by ID (for future use)
  const getRecipe = (recipeId: bigint) => {
    // This would need to be implemented as a separate hook if needed
    return { data: null, isLoading: false, error: null };
  };

  // Helper function to get recipe count
  const getRecipeCount = () => {
    return recipeCount;
  };

  // Register new recipe (admin only)
  const registerRecipe = async (
    inputs: Array<{ token: string; id: bigint; amount: bigint }>,
    outputToken: string,
    outputId: bigint,
    outputAmount: bigint
  ) => {
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.RecipeRegistry as `0x${string}`,
      abi: RECIPE_REGISTRY_ABI,
      functionName: 'registerRecipe',
      args: [
        inputs.map(input => ({
          token: input.token as `0x${string}`,
          id: input.id,
          amount: input.amount,
        })),
        outputToken as `0x${string}`,
        outputId,
        outputAmount,
      ],
      // Remove explicit gas limit for zkSync
    });
  };

  // Craft item using recipe
  const craft = async (recipeId: bigint, receiver: string): Promise<`0x${string}`> => {
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.RecipeRegistry as `0x${string}`,
      abi: RECIPE_REGISTRY_ABI,
      functionName: 'craft',
      args: [recipeId, receiver as `0x${string}`],
      // Remove explicit gas limit for zkSync
    });
  };

  // Helper function to get formatted recipes
  const getFormattedRecipes = (): CraftingRecipe[] => {
    if (!recipes) return [];

    return recipes.map((recipe, index) => ({
      id: BigInt(index),
      inputs: recipe.inputs.map(input => ({
        token: input.token,
        id: input.id,
        amount: input.amount,
        name: getTokenName(input.id), // You'd implement this based on your token metadata
      })),
      output: {
        token: recipe.outputToken,
        id: recipe.outputId,
        amount: recipe.outputAmount,
        name: getTokenName(recipe.outputId),
      },
      active: recipe.active,
    }));
  };

  // Helper function to get token name (you'd implement this based on your metadata)
  const getTokenName = (tokenId: bigint): string => {
    const names: Record<string, string> = {
      '1': 'Sword',
      '2': 'Shield',
      '3': 'Herb',
      '4': 'Potion',
      '42': 'Blessed Shield',
      '43': 'Super Potion',
      '44': 'Enchanted Sword',
    };
    return names[tokenId.toString()] || `Token #${tokenId}`;
  };

  return {
    getRecipe,
    getRecipeCount,
    getAllRecipes: () => ({ data: recipes, isLoading, error }),
    registerRecipe,
    craft,
    getFormattedRecipes,
  };
}
