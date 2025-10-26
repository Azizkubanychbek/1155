import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';

// PartyBackpack ABI (simplified)
const PARTY_BACKPACK_ABI = parseAbi([
  'function deposit(uint256 id, uint256 amount)',
  'function grantUsage(address to, uint256 id, uint256 amount, uint64 expires)',
  'function reclaim(uint256 id, uint256 amount)',
  'function activeUsers(uint256 id) view returns (uint256)',
  'function partyBalance(uint256 id) view returns (uint256)',
  'event PartyDeposit(address indexed depositor, uint256 indexed tokenId, uint256 amount)',
  'event PartyGrant(address indexed grantor, address indexed user, uint256 indexed tokenId, uint256 amount, uint64 expires)',
  'event PartyReclaim(address indexed reclaimer, uint256 indexed tokenId, uint256 amount)',
]);

export function useParty() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // Get party balance for a token
  const getPartyBalance = (tokenId: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.PartyBackpack as `0x${string}`,
      abi: PARTY_BACKPACK_ABI,
      functionName: 'partyBalance',
      args: [tokenId],
    });
  };

  // Get active users for a token
  const getActiveUsers = (tokenId: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.PartyBackpack as `0x${string}`,
      abi: PARTY_BACKPACK_ABI,
      functionName: 'activeUsers',
      args: [tokenId],
    });
  };

  // Deposit tokens to party backpack
  const deposit = async (tokenId: bigint, amount: bigint) => {
    console.log('💡 Совет: Депозит нескольких предметов одновременно экономит до 30% газа');
    
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.PartyBackpack as `0x${string}`,
      abi: PARTY_BACKPACK_ABI,
      functionName: 'deposit',
      args: [tokenId, amount],
      // zkSync оптимизирует автоматически
    });
  };

  // Grant usage rights from party inventory
  const grantUsage = async (to: string, tokenId: bigint, amount: bigint, expires: bigint) => {
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.PartyBackpack as `0x${string}`,
      abi: PARTY_BACKPACK_ABI,
      functionName: 'grantUsage',
      args: [to as `0x${string}`, tokenId, amount, expires],
    });
  };

  // Reclaim tokens from party backpack
  const reclaim = async (tokenId: bigint, amount: bigint) => {
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.PartyBackpack as `0x${string}`,
      abi: PARTY_BACKPACK_ABI,
      functionName: 'reclaim',
      args: [tokenId, amount],
    });
  };

  return {
    getPartyBalance,
    getActiveUsers,
    deposit,
    grantUsage,
    reclaim,
  };
}
