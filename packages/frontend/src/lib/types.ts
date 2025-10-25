// Type definitions for Backpack Guilds

export interface UserRecord {
  user: string;
  expires: bigint;
  amountGranted: bigint;
}

export interface Ingredient {
  token: string;
  id: bigint;
  amount: bigint;
}

export interface Recipe {
  inputs: Ingredient[];
  outputToken: string;
  outputId: bigint;
  outputAmount: bigint;
  active: boolean;
}

export interface Rental {
  lender: string;
  borrower: string;
  token: string;
  id: bigint;
  amount: bigint;
  expires: bigint;
  deposit: bigint;
  completed: boolean;
  penalized: boolean;
}

export interface TokenMetadata {
  id: bigint;
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface BackpackItem {
  id: bigint;
  balance: bigint;
  metadata?: TokenMetadata;
}

export interface PartyItem {
  id: bigint;
  balance: bigint;
  activeUsers: bigint;
  metadata?: TokenMetadata;
}

export interface CraftingRecipe {
  id: bigint;
  inputs: Array<{
    token: string;
    id: bigint;
    amount: bigint;
    name: string;
  }>;
  output: {
    token: string;
    id: bigint;
    amount: bigint;
    name: string;
  };
  active: boolean;
}
