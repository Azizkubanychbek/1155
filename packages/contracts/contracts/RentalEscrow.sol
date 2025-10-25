// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IRentalEscrow.sol";
import "./ReputationSystem.sol";

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
    
    // Reputation system integration
    ReputationSystem public reputationSystem;
    
    // Enhanced protection mechanisms
    uint256 public constant EARLY_REVOKE_PENALTY = 50; // 50% penalty for early revoke
    uint256 public constant MIN_RENTAL_DURATION = 1 hours;
    uint256 public constant DISPUTE_WINDOW = 24 hours;
    
    // Dispute tracking
    mapping(uint256 => bool) public hasDispute;
    mapping(uint256 => uint256) public disputeTimestamp;
    
    // Events for enhanced protection
    event EarlyRevokePenalty(uint256 indexed rentalId, address indexed lender, uint256 penaltyAmount);
    event DisputeCreated(uint256 indexed rentalId, address indexed reporter, string reason);
    event DisputeResolved(uint256 indexed rentalId, bool lenderFault, uint256 penaltyAmount);

    constructor(address _reputationSystem) {
        reputationSystem = ReputationSystem(_reputationSystem);
    }

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
        
        // Check reputation system
        require(reputationSystem.canPerformAction(lender), "RentalEscrow: lender reputation too low");
        require(reputationSystem.canPerformAction(borrower), "RentalEscrow: borrower reputation too low");
        
        // Check minimum rental duration
        require(expires - block.timestamp >= MIN_RENTAL_DURATION, "RentalEscrow: rental too short");

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
    
    /**
     * @dev Create a dispute for a rental
     */
    function createDispute(uint256 rentalId, string memory reason) external {
        require(rentalId < _rentalCount, "RentalEscrow: invalid rental ID");
        Rental storage rental = _rentalMap[rentalId];
        
        require(!rental.completed, "RentalEscrow: rental already completed");
        require(!hasDispute[rentalId], "RentalEscrow: dispute already exists");
        require(
            msg.sender == rental.lender || msg.sender == rental.borrower,
            "RentalEscrow: not authorized to create dispute"
        );
        
        hasDispute[rentalId] = true;
        disputeTimestamp[rentalId] = block.timestamp;
        
        emit DisputeCreated(rentalId, msg.sender, reason);
    }
    
    /**
     * @dev Resolve a dispute (only owner/DAO)
     */
    function resolveDispute(uint256 rentalId, bool lenderFault) external onlyOwner {
        require(rentalId < _rentalCount, "RentalEscrow: invalid rental ID");
        require(hasDispute[rentalId], "RentalEscrow: no dispute exists");
        
        Rental storage rental = _rentalMap[rentalId];
        require(!rental.completed, "RentalEscrow: rental already completed");
        
        uint256 penaltyAmount = 0;
        
        if (lenderFault) {
            // Lender is at fault - borrower gets compensation
            penaltyAmount = (rental.deposit * EARLY_REVOKE_PENALTY) / 100;
            payable(rental.borrower).transfer(penaltyAmount);
            payable(rental.lender).transfer(rental.deposit - penaltyAmount);
            
            // Record violation in reputation system
            reputationSystem.recordEarlyRevoke(rental.lender, rentalId);
        } else {
            // Borrower is at fault - lender gets deposit
            payable(rental.lender).transfer(rental.deposit);
        }
        
        rental.completed = true;
        hasDispute[rentalId] = false;
        
        emit DisputeResolved(rentalId, lenderFault, penaltyAmount);
    }
    
    /**
     * @dev Handle early revoke with penalty
     */
    function handleEarlyRevoke(uint256 rentalId) external onlyOwner {
        require(rentalId < _rentalCount, "RentalEscrow: invalid rental ID");
        Rental storage rental = _rentalMap[rentalId];
        
        require(!rental.completed, "RentalEscrow: rental already completed");
        require(block.timestamp < rental.expires, "RentalEscrow: rental not expired yet");
        
        // Calculate penalty
        uint256 penaltyAmount = (rental.deposit * EARLY_REVOKE_PENALTY) / 100;
        
        // Return partial deposit to borrower
        payable(rental.borrower).transfer(penaltyAmount);
        payable(rental.lender).transfer(rental.deposit - penaltyAmount);
        
        // Record early revoke in reputation system
        reputationSystem.recordEarlyRevoke(rental.lender, rentalId);
        
        rental.completed = true;
        
        emit EarlyRevokePenalty(rentalId, rental.lender, penaltyAmount);
    }
    
    /**
     * @dev Update reputation system address
     */
    function setReputationSystem(address _reputationSystem) external onlyOwner {
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Check if rental has active dispute
     */
    function hasActiveDispute(uint256 rentalId) external view returns (bool) {
        return hasDispute[rentalId];
    }
    
    /**
     * @dev Get dispute timestamp
     */
    function getDisputeTimestamp(uint256 rentalId) external view returns (uint256) {
        return disputeTimestamp[rentalId];
    }
}
