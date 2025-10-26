import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { UserRecord } from '@/lib/types';
import { mockContractCall, mockWriteContract, MOCK_TOKENS } from '@/lib/mocks';

// UsageRights1155 ABI (simplified)
const USAGE_RIGHTS_ABI = parseAbi([
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function userOf(uint256 id, address owner) view returns (address user, uint64 expires, uint256 amountGranted)',
  'function isUserActive(uint256 id, address owner, address user) view returns (bool)',
  'function setUser(uint256 id, address user, uint256 amount, uint64 expires)',
  'function revokeUser(uint256 id, address user)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'event UpdateUser(address indexed owner, address indexed user, uint256 indexed id, uint256 amount, uint64 expires)',
]);

export function useBackpack() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  
  // Check if we're in development mode (no contract addresses)
  const isDevelopmentMode = !CONTRACT_ADDRESSES.UsageRights1155 || CONTRACT_ADDRESSES.UsageRights1155 === '0x0000000000000000000000000000000000000000';

  // Get balances for all tokens (1-4)
  const swordBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, BigInt(1)],
    query: {
      enabled: !!address,
    },
  });

  const shieldBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, BigInt(2)],
    query: {
      enabled: !!address,
    },
  });

  const herbBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, BigInt(3)],
    query: {
      enabled: !!address,
    },
  });

  const potionBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, BigInt(4)],
    query: {
      enabled: !!address,
    },
  });

  // Helper function to get balance by token ID
  const getBalance = (tokenId: bigint) => {
    if (isDevelopmentMode) {
      // Return mock data in development mode
      const mockToken = MOCK_TOKENS.find(token => token.id === tokenId);
      return { 
        data: BigInt(mockToken?.balance || 0), 
        isLoading: false, 
        error: null 
      };
    }
    
    switch (tokenId.toString()) {
      case '1':
        return swordBalance;
      case '2':
        return shieldBalance;
      case '3':
        return herbBalance;
      case '4':
        return potionBalance;
      default:
        return { data: BigInt(0), isLoading: false, error: null };
    }
  };

  // Set usage rights
  const setUser = async (tokenId: bigint, user: string, amount: bigint, expires: bigint) => {
    if (isDevelopmentMode) {
      return mockWriteContract('setUser', [tokenId, user, amount, expires]);
    }
    
    return writeContract({
      address: CONTRACT_ADDRESSES.UsageRights1155,
      abi: USAGE_RIGHTS_ABI,
      functionName: 'setUser',
      args: [tokenId, user as `0x${string}`, amount, expires],
    });
  };

  // Revoke usage rights
  const revokeUser = async (tokenId: bigint, user: string) => {
    if (isDevelopmentMode) {
      return mockWriteContract('revokeUser', [tokenId, user]);
    }
    
    return writeContract({
      address: CONTRACT_ADDRESSES.UsageRights1155,
      abi: USAGE_RIGHTS_ABI,
      functionName: 'revokeUser',
      args: [tokenId, user as `0x${string}`],
    });
  };

  // Set approval for all
  const setApprovalForAll = async (operator: string, approved: boolean) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.UsageRights1155,
      abi: USAGE_RIGHTS_ABI,
      functionName: 'setApprovalForAll',
      args: [operator as `0x${string}`, approved],
    });
  };

  return {
    getBalance,
    setUser,
    revokeUser,
    setApprovalForAll,
  };
}
