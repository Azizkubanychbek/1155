// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ReputationSystem.sol";

/**
 * @title RentalInsurance
 * @dev Insurance system for rental protection against fraud and early revokes
 */
contract RentalInsurance is Ownable, ReentrancyGuard {
    
    struct InsurancePolicy {
        uint256 policyId;
        address borrower;
        uint256 rentalId;
        uint256 coverageAmount;
        uint256 premium;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool claimed;
    }
    
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        string reason;
        uint256 amount;
        bool approved;
        bool processed;
    }
    
    // Policy tracking
    mapping(uint256 => InsurancePolicy) public policies;
    mapping(address => uint256[]) public userPolicies;
    uint256 public policyCount;
    
    // Claim tracking
    mapping(uint256 => Claim) public claims;
    uint256 public claimCount;
    
    // Insurance parameters
    uint256 public constant PREMIUM_RATE = 5; // 5% of coverage amount
    uint256 public constant MAX_COVERAGE = 10 ether; // Maximum coverage per policy
    uint256 public constant MIN_COVERAGE = 0.01 ether; // Minimum coverage per policy
    
    // Reputation system integration
    ReputationSystem public reputationSystem;
    
    // Insurance pool
    uint256 public insurancePool;
    uint256 public totalPayouts;
    
    // Events
    event PolicyCreated(uint256 indexed policyId, address indexed borrower, uint256 coverageAmount, uint256 premium);
    event PolicyClaimed(uint256 indexed policyId, address indexed claimant, uint256 amount);
    event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, string reason);
    event ClaimProcessed(uint256 indexed claimId, bool approved, uint256 amount);
    event PoolDeposited(uint256 amount);
    event PoolWithdrawn(uint256 amount);
    
    constructor(address _reputationSystem) {
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Create insurance policy for a rental
     */
    function createPolicy(
        uint256 rentalId,
        uint256 coverageAmount
    ) external payable nonReentrant returns (uint256 policyId) {
        require(coverageAmount >= MIN_COVERAGE, "RentalInsurance: coverage too low");
        require(coverageAmount <= MAX_COVERAGE, "RentalInsurance: coverage too high");
        
        // Check borrower reputation
        require(reputationSystem.canPerformAction(msg.sender), "RentalInsurance: borrower reputation too low");
        
        // Calculate premium (5% of coverage)
        uint256 premium = (coverageAmount * PREMIUM_RATE) / 100;
        require(msg.value >= premium, "RentalInsurance: insufficient premium");
        
        policyId = policyCount++;
        policies[policyId] = InsurancePolicy({
            policyId: policyId,
            borrower: msg.sender,
            rentalId: rentalId,
            coverageAmount: coverageAmount,
            premium: premium,
            startTime: block.timestamp,
            endTime: block.timestamp + 7 days, // 7-day policy
            isActive: true,
            claimed: false
        });
        
        userPolicies[msg.sender].push(policyId);
        insurancePool += premium;
        
        // Refund excess premium
        if (msg.value > premium) {
            payable(msg.sender).transfer(msg.value - premium);
        }
        
        emit PolicyCreated(policyId, msg.sender, coverageAmount, premium);
    }
    
    /**
     * @dev Submit a claim for insurance payout
     */
    function submitClaim(
        uint256 policyId,
        string memory reason
    ) external nonReentrant returns (uint256 claimId) {
        require(policyId < policyCount, "RentalInsurance: invalid policy ID");
        InsurancePolicy storage policy = policies[policyId];
        
        require(policy.borrower == msg.sender, "RentalInsurance: not policy holder");
        require(policy.isActive, "RentalInsurance: policy not active");
        require(!policy.claimed, "RentalInsurance: policy already claimed");
        require(block.timestamp <= policy.endTime, "RentalInsurance: policy expired");
        
        claimId = claimCount++;
        claims[claimId] = Claim({
            claimId: claimId,
            policyId: policyId,
            claimant: msg.sender,
            reason: reason,
            amount: policy.coverageAmount,
            approved: false,
            processed: false
        });
        
        emit ClaimSubmitted(claimId, policyId, reason);
    }
    
    /**
     * @dev Process a claim (only owner/DAO)
     */
    function processClaim(uint256 claimId, bool approved) external onlyOwner nonReentrant {
        require(claimId < claimCount, "RentalInsurance: invalid claim ID");
        Claim storage claim = claims[claimId];
        
        require(!claim.processed, "RentalInsurance: claim already processed");
        
        claim.processed = true;
        claim.approved = approved;
        
        if (approved) {
            // Check if insurance pool has sufficient funds
            require(insurancePool >= claim.amount, "RentalInsurance: insufficient pool funds");
            
            // Pay out claim
            insurancePool -= claim.amount;
            totalPayouts += claim.amount;
            payable(claim.claimant).transfer(claim.amount);
            
            // Mark policy as claimed
            policies[claim.policyId].claimed = true;
            policies[claim.policyId].isActive = false;
            
            emit PolicyClaimed(claim.policyId, claim.claimant, claim.amount);
        }
        
        emit ClaimProcessed(claimId, approved, claim.amount);
    }
    
    /**
     * @dev Deposit funds to insurance pool (only owner)
     */
    function depositToPool() external payable onlyOwner {
        require(msg.value > 0, "RentalInsurance: amount must be positive");
        insurancePool += msg.value;
        emit PoolDeposited(msg.value);
    }
    
    /**
     * @dev Withdraw excess funds from insurance pool (only owner)
     */
    function withdrawFromPool(uint256 amount) external onlyOwner {
        require(amount <= insurancePool, "RentalInsurance: insufficient pool balance");
        require(amount > 0, "RentalInsurance: amount must be positive");
        
        insurancePool -= amount;
        payable(owner()).transfer(amount);
        emit PoolWithdrawn(amount);
    }
    
    /**
     * @dev Get user's active policies
     */
    function getUserPolicies(address user) external view returns (uint256[] memory) {
        return userPolicies[user];
    }
    
    /**
     * @dev Get policy details
     */
    function getPolicy(uint256 policyId) external view returns (InsurancePolicy memory) {
        require(policyId < policyCount, "RentalInsurance: invalid policy ID");
        return policies[policyId];
    }
    
    /**
     * @dev Get claim details
     */
    function getClaim(uint256 claimId) external view returns (Claim memory) {
        require(claimId < claimCount, "RentalInsurance: invalid claim ID");
        return claims[claimId];
    }
    
    /**
     * @dev Check if user can purchase insurance
     */
    function canPurchaseInsurance(address user) external view returns (bool) {
        return reputationSystem.canPerformAction(user);
    }
    
    /**
     * @dev Calculate premium for given coverage
     */
    function calculatePremium(uint256 coverageAmount) external pure returns (uint256) {
        return (coverageAmount * PREMIUM_RATE) / 100;
    }
    
    /**
     * @dev Get insurance pool balance
     */
    function getPoolBalance() external view returns (uint256) {
        return insurancePool;
    }
    
    /**
     * @dev Update reputation system address
     */
    function setReputationSystem(address _reputationSystem) external onlyOwner {
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Emergency function to pause new policies
     */
    function pauseNewPolicies() external onlyOwner {
        // This would require implementing a pause mechanism
        // For now, this is a placeholder
    }
}
