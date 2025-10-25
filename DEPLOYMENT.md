# Deployment Guide

This guide will help you deploy the Backpack Guilds protocol to zkSync Sepolia testnet.

## Prerequisites

- Node.js 18+ and pnpm
- A wallet with zkSync Sepolia ETH for gas fees
- Private key for deployment (keep secure!)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create `.env` file in `packages/contracts/`:

```env
XSOLLA_ZK_SEPOLIA_RPC=https://sepolia.era.zksync.dev
XSOLLA_ZK_CHAIN_ID=300
ETH_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# Contract addresses (auto-generated after deployment)
USAGE_RIGHTS_ADDRESS=0xfbA1b6DCcB692DC9b7221E66D63E9bF2c643199c
PARTY_BACKPACK_ADDRESS=0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9
RECIPE_REGISTRY_ADDRESS=0x9628fa7Aaac8d27D92c4AF1F1eBF83024d0B7A04
RENTAL_ESCROW_ADDRESS=0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159
```

### 3. Deploy Smart Contracts

```bash
cd packages/contracts
pnpm deploy:zkSyncSepolia
```

### 4. Update Frontend Addresses

```bash
node get-addresses.js
```

### 5. Start Frontend

```bash
cd packages/frontend
pnpm dev
```

## Contract Addresses

Current deployed addresses on zkSync Sepolia:

- **UsageRights1155**: `0xfbA1b6DCcB692DC9b7221E66D63E9bF2c643199c`
- **PartyBackpack**: `0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9`
- **RecipeRegistry**: `0x9628fa7Aaac8d27D92c4AF1F1eBF83024d0B7A04`
- **RentalEscrow**: `0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159`

## Testing

### Run Tests

```bash
cd packages/contracts
pnpm test
```

### Check Contract State

```bash
node check-recipes.js
```

## Frontend Development

The frontend is built with Next.js 14 and includes:

- Wallet connection (MetaMask, WalletConnect)
- Contract interaction hooks
- Responsive UI with TailwindCSS
- SSR-safe wallet connectors

### Available Pages

- `/` - Landing page
- `/backpack` - Personal inventory
- `/party` - Guild shared inventory
- `/craft` - On-chain crafting
- `/rent` - Rental system

## Troubleshooting

### Common Issues

1. **"indexedDB is not defined"** - This is normal during SSR, the app will work in browser
2. **"No recipes available"** - Make sure RecipeRegistry is deployed and has recipes
3. **Connection issues** - Check RPC URL and network settings

### Getting Test ETH

Get zkSync Sepolia ETH from:
- [zkSync Faucet](https://portal.zksync.io/faucet)
- [Sepolia Faucet](https://sepoliafaucet.com/)

## Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet
- Keep deployment keys secure

## Support

For issues and questions:
- Check the [Issues](https://github.com/your-username/backpack-guilds/issues) page
- Review contract documentation
- Test on testnet first
