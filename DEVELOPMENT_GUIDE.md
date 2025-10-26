# 🚀 Development Guide

## Quick Start (Development Mode)

The project is designed to work in development mode with mock data, so you can start developing immediately without deploying contracts.

### 1. Clone and Install

```bash
git clone https://github.com/anteyko-labs/backpack-guilds.git
cd backpack-guilds
pnpm install
```

### 2. Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000` with mock data.

## Development Features

### Mock Data System

The frontend automatically detects when contracts are not deployed and switches to mock mode:

- **Mock Tokens**: Pre-defined items (Sword, Shield, Herb, Potion)
- **Mock Balances**: Random balances for testing
- **Mock Transactions**: Simulated contract calls
- **Mock Party Members**: Sample guild members

### Available Pages

- **`/`** - Landing page with overview
- **`/backpack`** - Personal inventory (with mock data)
- **`/party`** - Guild shared inventory (with mock data)
- **`/craft`** - On-chain crafting recipes (with mock data)
- **`/rent`** - Rental system (with mock data)
- **`/game`** - Interactive game demo

## Production Deployment

### 1. Configure Environment

Create `.env` files:

**packages/contracts/.env:**
```env
XSOLLA_ZK_SEPOLIA_RPC=https://sepolia.era.zksync.dev
XSOLLA_ZK_CHAIN_ID=300
ETH_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

**packages/frontend/.env.local:**
```env
NEXT_PUBLIC_XSOLLA_ZK_RPC=https://sepolia.era.zksync.dev
NEXT_PUBLIC_CHAIN_ID=300
NEXT_PUBLIC_USAGE_RIGHTS_ADDRESS=0xfbA1b6DCcB692DC9b7221E66D63E9bF2c643199c
NEXT_PUBLIC_PARTY_BACKPACK_ADDRESS=0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9
NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS=0x9628fa7Aaac8d27D92c4AF1F1eBF83024d0B7A04
NEXT_PUBLIC_RENTAL_ESCROW_ADDRESS=0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159
```

### 2. Deploy Contracts

```bash
cd packages/contracts
pnpm deploy:xsolla
```

### 3. Update Frontend Addresses

After deployment, update the contract addresses in `packages/frontend/src/lib/addresses.ts`.

## Testing

### Run Tests

```bash
# Test contracts
cd packages/contracts
pnpm test

# Test frontend
cd packages/frontend
pnpm test
```

### Test Coverage

The project includes tests for:
- ✅ Usage rights functionality
- ✅ Party inventory management
- ✅ Crafting system
- ✅ Rental escrow
- ✅ Reputation system
- ✅ Security mechanisms

## Architecture

### Smart Contracts

- **UsageRights1155**: ERC1155 with temporary usage rights (EIP-5006 concept)
- **PartyBackpack**: Shared inventory for guilds
- **RecipeRegistry**: On-chain crafting recipes
- **RentalEscrow**: Secure rental system with deposits
- **ReputationSystem**: User behavior tracking
- **RentalInsurance**: Optional fraud protection

### Frontend

- **Next.js 14** with TypeScript
- **TailwindCSS** for styling
- **Wagmi** for Web3 integration
- **Mock system** for development
- **Modular components** for easy customization

## Security Features

- ✅ Reentrancy protection
- ✅ Input validation
- ✅ Access controls
- ✅ Time-based expiration
- ✅ Reputation system
- ✅ Cooldown mechanisms
- ✅ Penalty system
- ✅ Dispute resolution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For questions or issues:
- Check the Issues page
- Review the documentation
- Contact the development team
