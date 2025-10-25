import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { UserRecord } from '@/lib/types';

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

  // Get balances for all tokens (1-4)
  const swordBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, 1n],
    query: {
      enabled: !!address,
    },
  });

  const shieldBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, 2n],
    query: {
      enabled: !!address,
    },
  });

  const herbBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, 3n],
    query: {
      enabled: !!address,
    },
  });

  const potionBalance = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'balanceOf',
    args: [address!, 4n],
    query: {
      enabled: !!address,
    },
  });

  // Helper function to get balance by token ID
  const getBalance = (tokenId: bigint) => {
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
        return { data: 0n, isLoading: false, error: null };
    }
  };

  // Set usage rights
  const setUser = async (tokenId: bigint, user: string, amount: bigint, expires: bigint) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.UsageRights1155,
      abi: USAGE_RIGHTS_ABI,
      functionName: 'setUser',
      args: [tokenId, user as `0x${string}`, amount, Number(expires)],
    });
  };

  // Revoke usage rights
  const revokeUser = async (tokenId: bigint, user: string) => {
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
