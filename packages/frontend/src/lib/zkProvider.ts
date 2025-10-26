import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

// Define zkSync Sepolia chain
export const zkSyncSepolia = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 300,
  name: 'zkSync Sepolia',
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

// Create public client for zkSync Sepolia
export const publicClient = createPublicClient({
  chain: zkSyncSepolia,
  transport: http(),
});
