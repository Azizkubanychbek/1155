import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';

// Define Xsolla ZK Sepolia chain
export const xsollaZkSepolia = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 555776,
  name: 'Xsolla ZK Sepolia Testnet',
  network: 'xsolla-zk-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_XSOLLA_ZK_RPC || 'https://zkrpc-sepolia.xsollazk.com'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_XSOLLA_ZK_RPC || 'https://zkrpc-sepolia.xsollazk.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Xsolla ZK Explorer', url: 'https://explorer-sepolia.xsollazk.com' },
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
  ],
  transports: {
    [xsollaZkSepolia.id]: http({
      batch: false, // Disable batching for zkSync
    }),
  },
  ssr: false, // Disable SSR for wallet connectors
});
