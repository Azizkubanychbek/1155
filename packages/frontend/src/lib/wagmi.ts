import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';

// Define zkSync Sepolia chain
export const zkSyncSepolia = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 300,
  name: 'zkSync Sepolia Testnet',
  network: 'zksync-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ZKSYNC_RPC || 'https://sepolia.era.zksync.dev'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ZKSYNC_RPC || 'https://sepolia.era.zksync.dev'],
    },
  },
  blockExplorers: {
    default: { name: 'zkSync Explorer', url: 'https://sepolia.explorer.zksync.io' },
  },
  testnet: true,
});

// Create wagmi config with client-side only connectors
export const config = createConfig({
  chains: [zkSyncSepolia],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: 'Backpack Guilds',
        url: 'https://backpackguilds.com',
      },
    }),
  ],
  transports: {
    [zkSyncSepolia.id]: http(),
  },
  ssr: false, // Disable SSR for wallet connectors
  // Add gas configuration for zkSync
  pollingInterval: 4000,
});
