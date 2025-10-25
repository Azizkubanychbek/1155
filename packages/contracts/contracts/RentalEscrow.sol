// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IRentalEscrow.sol";

/**
 * @title RentalEscrow
 * @dev Escrow system for item rentals with deposit management
 */
contract RentalEscrow is Ownable, ReentrancyGuard, IRentalEscrow {
    // Array of all rentals
    Rental[] private _rentals;
    
    // Mapping from rental ID => rental
    mapping(uint256 => Rental) private _rentalMap;
    
    // Total number of rentals
    uint256 private _rentalCount;
    
    // Platform fee (in basis points, e.g., 100 = 1%)
    uint256 public platformFee = 0; // No fee for demo

    constructor() {}

    /**
     * @dev Create a new rental
     */
    function createRental(
        address lender,
        address borrower,
        address token,
        uint256 id,
        uint256 amount,
        uint64 expires,
        uint256 deposit
    ) external payable override nonReentrant returns (uint256 rentalId) {
        require(lender != address(0), "RentalEscrow: invalid lender");
        require(borrower != address(0), "RentalEscrow: invalid borrower");
        require(token != address(0), "RentalEscrow: invalid token");
        require(amount > 0, "RentalEscrow: amount must be positive");
        require(expires > block.timestamp, "RentalEscrow: invalid expiration");
        require(deposit > 0, "RentalEscrow: deposit must be positive");
        require(msg.value >= deposit, "RentalEscrow: insufficient deposit");

        Rental memory newRental = Rental({
            lender: lender,
            borrower: borrower,
            token: token,
            id: id,
            amount: amount,
            expires: expires,
            deposit: deposit,
            completed: false,
            penalized: false
        });

        _rentals.push(newRental);
        _rentalMap[_rentalCount] = newRental;
        rentalId = _rentalCount;
        _rentalCount++;

        emit RentalCreated(rentalId, lender, borrower, token, id, amount, expires, deposit);
    }

    /**
     * @dev Complete a rental and return deposit
     */
    function completeRental(uint256 rentalId) external override nonReentrant {
        require(rentalId < _rentalCount, "RentalEscrow: invalid rental ID");
        Rental storage rental = _rentalMap[rentalId];
        
        require(!rental.completed, "RentalEscrow: rental already completed");
        require(!rental.penalized, "RentalEscrow: rental penalized");
        require(msg.sender == rental.borrower, "RentalEscrow: only borrower can complete");
        require(block.timestamp <= rental.expires, "RentalEscrow: rental expired");

        rental.completed = true;
        
        // Calculate fee and return amount
        uint256 fee = (rental.deposit * platformFee) / 10000;
        uint256 returnAmount = rental.deposit - fee;
        
        // Return deposit to borrower
        if (returnAmount > 0) {
            payable(rental.borrower).transfer(returnAmount);
        }
        
        // Send fee to owner (if any)
        if (fee > 0) {
            payable(owner()).transfer(fee);
        }

        emit RentalCompleted(rentalId, rental.borrower, returnAmount);
    }

    /**
     * @dev Penalize a rental (for violations)
     */
    function penalize(uint256 rentalId) external override nonReentrant onlyOwner {
        require(rentalId < _rentalCount, "RentalEscrow: invalid rental ID");
        Rental storage rental = _rentalMap[rentalId];
        
        require(!rental.completed, "RentalEscrow: rental already completed");
        require(!rental.penalized, "RentalEscrow: rental already penalized");

        rental.penalized = true;
        
        // Send deposit to lender as penalty
        payable(rental.lender).transfer(rental.deposit);

        emit RentalPenalized(rentalId, rental.lender, rental.deposit);
    }

    /**
     * @dev Get rental details
     */
    function getRental(uint256 rentalId) external view override returns (Rental memory) {
        require(rentalId < _rentalCount, "RentalEscrow: invalid rental ID");
        return _rentalMap[rentalId];
    }

    /**
     * @dev Get the total number of rentals
     */
    function getRentalCount() external view override returns (uint256) {
        return _rentalCount;
    }

    /**
     * @dev Get all rentals for a user
     */
    function getUserRentals(address user) external view returns (Rental[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _rentalCount; i++) {
            if (_rentalMap[i].lender == user || _rentalMap[i].borrower == user) {
                count++;
            }
        }
        
        Rental[] memory userRentals = new Rental[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _rentalCount; i++) {
            if (_rentalMap[i].lender == user || _rentalMap[i].borrower == user) {
                userRentals[index] = _rentalMap[i];
                index++;
            }
        }
        
        return userRentals;
    }

    /**
     * @dev Set platform fee (only owner)
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "RentalEscrow: fee too high"); // Max 10%
        platformFee = _platformFee;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
