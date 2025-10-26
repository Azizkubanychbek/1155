'use client';

import { useState, useEffect } from 'react';
import { useRent } from '@/hooks/useRent';
import { useAccount } from 'wagmi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ApproveButton } from './ApproveButton';

export function RentPanel() {
  const { address } = useAccount();
  const { createRental, completeRental, getUserRentals } = useRent();
  const [creating, setCreating] = useState(false);
  const [lender, setLender] = useState('');
  const [borrower, setBorrower] = useState('');
  const [token, setToken] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [amount, setAmount] = useState('');
  const [hours, setHours] = useState('');
  const [deposit, setDeposit] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleCreateRental = async () => {
    if (!lender || !borrower || !token || !tokenId || !amount || !hours || !deposit) return;
    
    setCreating(true);
    try {
      const expires = Math.floor(Date.now() / 1000) + parseInt(hours) * 3600;
      await createRental(
        lender,
        borrower,
        token,
        BigInt(tokenId),
        BigInt(amount),
        BigInt(expires),
        BigInt(deposit)
      );
      
      // Reset form
      setLender('');
      setBorrower('');
      setToken('');
      setTokenId('');
      setAmount('');
      setHours('');
      setDeposit('');
    } catch (error) {
      console.error('Error creating rental:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteRental = async (rentalId: bigint) => {
    try {
      await completeRental(rentalId);
    } catch (error) {
      console.error('Error completing rental:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Rental System</h2>
      
      {/* Approve RentalEscrow first */}
      <ApproveButton operator="RentalEscrow" />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create Rental" description="Create a new item rental with deposit">
          <div className="space-y-4">
            <Input
              label="Lender Address"
              placeholder="0x..."
              value={lender}
              onChange={(e) => setLender(e.target.value)}
            />
            
            <Input
              label="Borrower Address"
              placeholder="0x..."
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
            />
            
            <Input
              label="Token Contract"
              placeholder="0x..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Token ID"
                type="number"
                placeholder="1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
              
              <Input
                label="Amount"
                type="number"
                placeholder="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (hours)"
                type="number"
                placeholder="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              
              <Input
                label="Deposit (ETH)"
                type="number"
                step="0.001"
                placeholder="0.1"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleCreateRental}
              loading={creating}
              disabled={!lender || !borrower || !token || !tokenId || !amount || !hours || !deposit}
              className="w-full"
            >
              Create Rental
            </Button>
          </div>
        </Card>

        <Card title="My Rentals" description="Manage your active rentals">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your rentals will appear here once you create them.
            </p>
            
            <div className="text-sm text-gray-500">
              <p>• Create rentals with deposits for security</p>
              <p>• Complete rentals to get your deposit back</p>
              <p>• Penalties apply for violations</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
