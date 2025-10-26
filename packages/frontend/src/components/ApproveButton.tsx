'use client';

import { useState } from 'react';
import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { Button } from './ui/Button';

const USAGE_RIGHTS_ABI = parseAbi([
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
]);

interface ApproveButtonProps {
  operator: 'RecipeRegistry' | 'PartyBackpack' | 'RentalEscrow';
  onApproved?: () => void;
}

export function ApproveButton({ operator, onApproved }: ApproveButtonProps) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [isApproving, setIsApproving] = useState(false);

  const operatorAddress = CONTRACT_ADDRESSES[operator];

  // Check if already approved
  const { data: isApproved, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.UsageRights1155 as `0x${string}`,
    abi: USAGE_RIGHTS_ABI,
    functionName: 'isApprovedForAll',
    args: [address as `0x${string}`, operatorAddress as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // @ts-ignore - wagmi v2 type compatibility
      await writeContract({
        address: CONTRACT_ADDRESSES.UsageRights1155 as `0x${string}`,
        abi: USAGE_RIGHTS_ABI,
        functionName: 'setApprovalForAll',
        args: [operatorAddress as `0x${string}`, true],
      });
      
      // Wait a bit and refetch
      setTimeout(async () => {
        await refetch();
        if (onApproved) onApproved();
      }, 2000);
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  if (isApproved) {
    return (
      <div className="flex items-center text-green-600 text-sm">
        <span className="mr-2">✅</span>
        <span>Approved for {operator}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800 mb-3">
        <strong>⚠️ Approval Required:</strong> You need to approve {operator} to use your items.
        This is a one-time action.
      </p>
      <Button
        onClick={handleApprove}
        disabled={isApproving}
        className="w-full"
        variant="outline"
      >
        {isApproving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            Approving...
          </>
        ) : (
          `Approve ${operator}`
        )}
      </Button>
    </div>
  );
}

