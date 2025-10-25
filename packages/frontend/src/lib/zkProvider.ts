import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

// Define Xsolla ZK Sepolia chain
export const xsollaZkSepolia = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 0,
  name: 'Xsolla ZK Sepolia',
  network: 'xsolla-zk-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_XSOLLA_ZK_RPC || ''],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_XSOLLA_ZK_RPC || ''],
    },
  },
  blockExplorers: {
    default: { name: 'Xsolla ZK Explorer', url: 'https://explorer.xsolla-zk.com' },
  },
  testnet: true,
});

// Create public client for Xsolla ZK Sepolia
export const publicClient = createPublicClient({
  chain: xsollaZkSepolia,
  transport: http(),
});
