import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Define Xsolla ZK Sepolia chain
export const xsollaZkSepolia = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 300,
  name: 'Xsolla ZK Sepolia',
  network: 'xsolla-zk-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_XSOLLA_ZK_RPC || 'https://sepolia.era.zksync.dev'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_XSOLLA_ZK_RPC || 'https://sepolia.era.zksync.dev'],
    },
  },
  blockExplorers: {
    default: { name: 'Xsolla ZK Explorer', url: 'https://explorer.xsolla-zk.com' },
  },
  testnet: true,
});

// Create wagmi config with client-side only connectors
export const config = createConfig({
  chains: [xsollaZkSepolia],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: 'Backpack Guilds',
        url: 'https://backpackguilds.com',
      },
    }),
    // Temporarily disable WalletConnect to fix indexedDB errors
    // walletConnect({
    //   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    // }),
  ],
  transports: {
    [xsollaZkSepolia.id]: http(),
  },
  ssr: false, // Disable SSR for wallet connectors
});
