'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const ZKSYNC_SEPOLIA = {
  chainId: '0x12c', // 300 in hex
  chainName: 'zkSync Sepolia Testnet',
  rpcUrls: ['https://sepolia.era.zksync.dev'],
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://sepolia.explorer.zksync.io'],
};

export function NetworkSwitcher() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isAdding, setIsAdding] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const addNetwork = async () => {
    if (!window.ethereum) return;
    
    setIsAdding(true);
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ZKSYNC_SEPOLIA],
      });
    } catch (error) {
      console.error('Failed to add network:', error);
      alert('Failed to add network. Please add manually.');
    } finally {
      setIsAdding(false);
    }
  };

  const switchToZkSync = async () => {
    try {
      await switchChain({ chainId: 300 });
    } catch (error) {
      console.error('Failed to switch network:', error);
      // If chain is not added, try to add it
      await addNetwork();
    }
  };

  if (!isConnected) {
    return null;
  }

  const isCorrectNetwork = chain?.id === 300;

  if (isCorrectNetwork) {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <div>
            <h3 className="font-medium text-green-800">✅ Connected to zkSync Sepolia</h3>
            <p className="text-sm text-green-600">Ready for testing!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-yellow-800">⚠️ Wrong Network</h3>
          <p className="text-sm text-yellow-600">
            Please switch to zkSync Sepolia Testnet (Chain ID: 300)
          </p>
        </div>
        <Button
          onClick={switchToZkSync}
          disabled={isAdding}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {isAdding ? 'Adding...' : 'Switch Network'}
        </Button>
      </div>
    </Card>
  );
}
