import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { Rental } from '@/lib/types';

// RentalEscrow ABI from artifacts
const RENTAL_ESCROW_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "rentalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "depositReturned",
        "type": "uint256"
      }
    ],
    "name": "RentalCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "rentalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "expires",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deposit",
        "type": "uint256"
      }
    ],
    "name": "RentalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "rentalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "penaltyAmount",
        "type": "uint256"
      }
    ],
    "name": "RentalPenalized",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "rentalId",
        "type": "uint256"
      }
    ],
    "name": "completeRental",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "expires",
        "type": "uint64"
      },
      {
        "internalType": "uint256",
        "name": "deposit",
        "type": "uint256"
      }
    ],
    "name": "createRental",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "rentalId",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "rentalId",
        "type": "uint256"
      }
    ],
    "name": "getRental",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "lender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "borrower",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "expires",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "deposit",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "penalized",
            "type": "bool"
          }
        ],
        "internalType": "struct IRentalEscrow.Rental",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRentalCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserRentals",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "lender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "borrower",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "expires",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "deposit",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "penalized",
            "type": "bool"
          }
        ],
        "internalType": "struct IRentalEscrow.Rental[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "rentalId",
        "type": "uint256"
      }
    ],
    "name": "penalize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_platformFee",
        "type": "uint256"
      }
    ],
    "name": "setPlatformFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export function useRent() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // Get rental details
  const getRental = (rentalId: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.RentalEscrow,
      abi: RENTAL_ESCROW_ABI,
      functionName: 'getRental',
      args: [rentalId],
    });
  };

  // Get total rental count
  const getRentalCount = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.RentalEscrow,
      abi: RENTAL_ESCROW_ABI,
      functionName: 'getRentalCount',
    });
  };

  // Get user rentals
  const getUserRentals = (user: string) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.RentalEscrow,
      abi: RENTAL_ESCROW_ABI,
      functionName: 'getUserRentals',
      args: [user as `0x${string}`],
    });
  };

  // Create rental
  const createRental = async (
    lender: string,
    borrower: string,
    token: string,
    tokenId: bigint,
    amount: bigint,
    expires: bigint,
    deposit: bigint
  ) => {
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.RentalEscrow as `0x${string}`,
      abi: RENTAL_ESCROW_ABI,
      functionName: 'createRental',
      args: [
        lender as `0x${string}`,
        borrower as `0x${string}`,
        token as `0x${string}`,
        tokenId,
        amount,
        expires, // Already bigint, no need to convert
        deposit,
      ],
      value: deposit,
      // Remove explicit gas limit for zkSync
    });
  };

  // Complete rental
  const completeRental = async (rentalId: bigint) => {
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.RentalEscrow as `0x${string}`,
      abi: RENTAL_ESCROW_ABI,
      functionName: 'completeRental',
      args: [rentalId],
      // Remove explicit gas limit for zkSync
    });
  };

  // Penalize rental (admin only)
  const penalize = async (rentalId: bigint) => {
    // @ts-ignore - wagmi v2 type compatibility
    return writeContract({
      address: CONTRACT_ADDRESSES.RentalEscrow as `0x${string}`,
      abi: RENTAL_ESCROW_ABI,
      functionName: 'penalize',
      args: [rentalId],
      // Remove explicit gas limit for zkSync
    });
  };

  return {
    getRental,
    getRentalCount,
    getUserRentals,
    createRental,
    completeRental,
    penalize,
  };
}
