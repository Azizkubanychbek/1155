# 🎮 Complete Features Guide: Backpack Guilds

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Smart Contracts](#smart-contracts)
3. [Frontend Application](#frontend-application)
4. [Security Mechanisms](#security-mechanisms)
5. [Deployment Guide](#deployment-guide)
6. [User Interface](#user-interface)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Features](#advanced-features)
10. [Contributing](#contributing)

## 🎯 Project Overview

Backpack Guilds is a comprehensive gaming protocol built on Xsolla ZK (zkSync-based L2) that enables:

- **Temporary Item Usage Rights** - Lend items without transferring ownership
- **Party/Guild Inventory Sharing** - Collaborative resource management
- **On-Chain Crafting** - Transparent and verifiable item creation
- **Secure Rental System** - Escrow-based rentals with deposits
- **Reputation System** - User behavior tracking and trust scores
- **Insurance System** - Protection against fraud and early revokes
- **Dispute Resolution** - Community-driven conflict resolution

## 🏗️ Smart Contracts

### Core Contracts

#### 1. **UsageRights1155** - ERC1155 with Temporary Usage Rights
```solidity
// Key Functions:
function setUser(uint256 id, address user, uint256 amount, uint64 expires)
function revokeUser(uint256 id, address user)
function userOf(uint256 id, address owner) returns (address, uint64)
function isUserActive(uint256 id, address owner, address user) returns (bool)

// Security Features:
- Reputation system integration
- Cooldown protection (1 hour minimum)
- Early revoke detection
- Minimum rental duration (30 minutes)
```

#### 2. **PartyBackpack** - Shared Inventory System
```solidity
// Key Functions:
function joinParty(address partyAddress)
function leaveParty()
function depositItem(uint256 tokenId, uint256 amount)
function withdrawItem(uint256 tokenId, uint256 amount)
function getPartyBalance(address party, uint256 tokenId) returns (uint256)

// Features:
- Shared inventory management
- Party member management
- Item deposit/withdrawal
- Balance tracking
```

#### 3. **RecipeRegistry** - On-Chain Crafting
```solidity
// Key Functions:
function addRecipe(Recipe memory recipe)
function executeRecipe(uint256 recipeId, uint256[] memory inputAmounts)
function getRecipe(uint256 recipeId) returns (Recipe memory)
function getAllRecipes() returns (Recipe[] memory)

// Recipe Structure:
struct Recipe {
    uint256 id;
    string name;
    string description;
    uint256[] inputTokens;
    uint256[] inputAmounts;
    uint256[] outputTokens;
    uint256[] outputAmounts;
    bool active;
}
```

#### 4. **RentalEscrow** - Secure Rental System
```solidity
// Key Functions:
function createRental(address lender, address borrower, address token, uint256 id, uint256 amount, uint64 expires, uint256 deposit)
function completeRental(uint256 rentalId)
function createDispute(uint256 rentalId, string memory reason)
function resolveDispute(uint256 rentalId, bool lenderFault)

// Security Features:
- Reputation checks
- Minimum rental duration (1 hour)
- Dispute resolution
- Early revoke penalties (50%)
```

### Security Contracts

#### 5. **ReputationSystem** - User Behavior Tracking
```solidity
// Key Functions:
function updateSuccessfulRental(address user)
function reportViolation(address violator, uint256 rentalId, string memory reason)
function recordEarlyRevoke(address user, uint256 rentalId)
function canPerformAction(address user) returns (bool)

// Reputation Calculation:
- Base rating from success rate
- Penalties for violations (-100 points)
- Penalties for early revokes (-50 points)
- Blacklist after 3+ violations
```

#### 6. **RentalInsurance** - Fraud Protection
```solidity
// Key Functions:
function createPolicy(uint256 rentalId, uint256 coverageAmount)
function submitClaim(uint256 policyId, string memory reason)
function processClaim(uint256 claimId, bool approved)

// Insurance Parameters:
- Coverage: 0.01-10 ETH
- Premium: 5% of coverage
- Policy duration: 7 days
- Manual claim review
```

## 🎨 Frontend Application

### Technology Stack
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Wagmi** - Web3 integration
- **Viem** - Ethereum library

### Application Structure

#### Pages
- **`/`** - Landing page
- **`/backpack`** - Personal inventory management
- **`/party`** - Group inventory sharing
- **`/craft`** - On-chain crafting interface
- **`/rent`** - Rental marketplace

#### Components
- **`BackpackList`** - Personal item management
- **`PartyInventory`** - Group inventory interface
- **`CraftPanel`** - Crafting interface
- **`RentPanel`** - Rental marketplace
- **`ClientNavbar`** - Navigation with wallet connection
- **`WalletConnect`** - Wallet connection component

#### Hooks
- **`useBackpack`** - Personal inventory management
- **`useParty`** - Group inventory operations
- **`useCraft`** - Crafting operations
- **`useRent`** - Rental operations

## 🛡️ Security Mechanisms

### 1. Reputation System
- **Scale**: 0-1000 points
- **New users**: 500 points (neutral)
- **Good reputation**: 700+ points
- **Poor reputation**: <300 points (limited access)
- **Blacklist**: 7 days for 3+ violations

### 2. Cooldown Protection
- **Revoke cooldown**: 1 hour minimum
- **Minimum rental duration**: 30 minutes
- **Early revoke detection**: Automatic tracking

### 3. Penalty System
- **Early revoke penalty**: 50% of deposit
- **Violation penalty**: -100 reputation points
- **Dispute spam penalty**: -25 reputation points

### 4. Insurance System
- **Coverage range**: 0.01-10 ETH
- **Premium rate**: 5% of coverage
- **Policy duration**: 7 days
- **Claim process**: Manual review

### 5. Dispute Resolution
- **Dispute window**: 24 hours
- **Community voting**: DAO resolution
- **Evidence-based**: Screenshots, logs
- **Automatic penalties**: Based on decisions

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- pnpm package manager
- Wallet with testnet ETH
- Xsolla ZK Sepolia RPC access

### Environment Setup

#### 1. Install Dependencies
```bash
pnpm install
```

#### 2. Configure Environment Variables

**Contracts (.env):**
```env
PRIVATE_KEY=your_private_key
XSOLLA_ZK_SEPOLIA_RPC=https://sepolia.era.zksync.dev
USAGE_RIGHTS_ADDRESS=0x...
PARTY_BACKPACK_ADDRESS=0x...
RECIPE_REGISTRY_ADDRESS=0x...
RENTAL_ESCROW_ADDRESS=0x...
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_XSOLLA_ZK_RPC=https://sepolia.era.zksync.dev
NEXT_PUBLIC_CHAIN_ID=300
NEXT_PUBLIC_USAGE_RIGHTS_ADDRESS=0x...
NEXT_PUBLIC_PARTY_BACKPACK_ADDRESS=0x...
NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_RENTAL_ESCROW_ADDRESS=0x...
```

### Deployment Process

#### 1. Deploy Smart Contracts
```bash
cd packages/contracts
pnpm compile
pnpm deploy:zkSync
```

#### 2. Update Frontend Addresses
```bash
node get-addresses.js
```

#### 3. Start Frontend
```bash
cd packages/frontend
pnpm dev
```

## 🎮 User Interface

### Navigation
- **Connect Wallet** - MetaMask, WalletConnect
- **My Backpack** - Personal inventory
- **Party** - Group inventory
- **Craft** - Item crafting
- **Rent** - Rental marketplace

### Key Features

#### Backpack Management
- View item balances
- Grant usage rights
- Set expiration times
- Monitor usage history

#### Party Inventory
- Create/join parties
- Share items with group
- Monitor group activity
- Manage group permissions

#### Crafting System
- View available recipes
- Check required materials
- Execute crafting recipes
- Receive new items

#### Rental Marketplace
- Browse available items
- Check owner reputation
- Buy insurance
- Create rental offers

## 📚 API Reference

### Smart Contract Functions

#### UsageRights1155
```typescript
// Set usage rights
await contract.setUser(tokenId, userAddress, amount, expirationTime)

// Revoke usage rights
await contract.revokeUser(tokenId, userAddress)

// Check user status
const user = await contract.userOf(tokenId, ownerAddress)
const isActive = await contract.isUserActive(tokenId, ownerAddress, userAddress)
```

#### PartyBackpack
```typescript
// Join party
await contract.joinParty(partyAddress)

// Deposit item
await contract.depositItem(tokenId, amount)

// Withdraw item
await contract.withdrawItem(tokenId, amount)
```

#### RecipeRegistry
```typescript
// Get all recipes
const recipes = await contract.getAllRecipes()

// Execute recipe
await contract.executeRecipe(recipeId, inputAmounts)
```

#### RentalEscrow
```typescript
// Create rental
await contract.createRental(lender, borrower, token, id, amount, expires, deposit)

// Complete rental
await contract.completeRental(rentalId)

// Create dispute
await contract.createDispute(rentalId, reason)
```

### Frontend Hooks

#### useBackpack
```typescript
const {
  balance,
  isLoading,
  grantRights,
  revokeRights,
  getUserRecord
} = useBackpack()
```

#### useParty
```typescript
const {
  partyBalance,
  activeUsers,
  joinParty,
  leaveParty,
  depositItem,
  withdrawItem
} = useParty()
```

#### useCraft
```typescript
const {
  recipes,
  isLoading,
  executeRecipe,
  getFormattedRecipes
} = useCraft()
```

#### useRent
```typescript
const {
  rentals,
  createRental,
  completeRental,
  createDispute
} = useRent()
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Wallet Connection Issues
- **Problem**: "indexedDB is not defined"
- **Solution**: Ensure wallet connectors are client-side only
- **Fix**: Use `'use client'` directive and `ssr: false`

#### 2. Contract Interaction Issues
- **Problem**: "Invalid ABI parameter"
- **Solution**: Update ABI to match deployed contracts
- **Fix**: Use correct contract addresses and ABIs

#### 3. Hydration Errors
- **Problem**: "Text content does not match server-rendered HTML"
- **Solution**: Add hydration checks
- **Fix**: Use `isHydrated` state and conditional rendering

#### 4. Reputation Issues
- **Problem**: "User reputation too low"
- **Solution**: Build reputation through successful rentals
- **Fix**: Start with small items, maintain good behavior

### Debug Commands

#### Check Contract Status
```bash
cd packages/contracts
pnpm compile
pnpm test
```

#### Check Frontend
```bash
cd packages/frontend
pnpm build
pnpm dev
```

#### Check Deployment
```bash
node get-addresses.js
```

## 🚀 Advanced Features

### 1. Custom Recipes
Create custom crafting recipes:
```typescript
const recipe = {
  id: 1,
  name: "Custom Sword",
  description: "A powerful custom sword",
  inputTokens: [1, 2], // Sword + Shield
  inputAmounts: [1, 1],
  outputTokens: [5], // Custom Sword
  outputAmounts: [1],
  active: true
}
```

### 2. Insurance Strategies
- **High-value items**: Always buy insurance
- **Long-term rentals**: Consider insurance
- **New owners**: Check reputation first
- **Dispute history**: Avoid problematic owners

### 3. Reputation Building
- **Start small**: Rent cheap items first
- **Be honest**: Don't revoke rights early
- **Help community**: Participate in disputes
- **Long-term usage**: Regular platform use

### 4. Party Management
- **Trusted members**: Only invite reliable users
- **Clear rules**: Establish group guidelines
- **Monitor activity**: Track member behavior
- **Regular updates**: Keep group active

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing

### Testing
```bash
# Run tests
pnpm test

# Run specific test
pnpm test -- --grep "UsageRights1155"

# Run with coverage
pnpm test -- --coverage
```

## 📞 Support

### Documentation
- [User Guide](USER_GUIDE_EN.md) - Complete user instructions
- [Quick Start](QUICK_START_GUIDE_EN.md) - 5-minute onboarding
- [Security Mechanisms](packages/contracts/SECURITY_MECHANISMS.md) - Security features
- [Deployment Guide](DEPLOYMENT.md) - Setup instructions

### Community
- **Discord**: [Discord server link]
- **Telegram**: [Telegram group link]
- **GitHub**: [Repository issues](https://github.com/anteyko-labs/backpack-guilds/issues)

### Contact
- **Email**: support@backpackguilds.com
- **Website**: https://backpackguilds.com
- **Twitter**: @BackpackGuilds

---

**Built on Xsolla ZK • Gaming Use Case • No Gambling • MIT License**
