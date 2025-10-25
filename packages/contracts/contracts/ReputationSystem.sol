// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ReputationSystem
 * @dev Decentralized reputation system for Backpack Guilds protocol
 * Tracks user behavior and provides trust scores
 */
contract ReputationSystem is Ownable, ReentrancyGuard {
    
    struct UserReputation {
        uint256 totalRentals;        // Total number of rentals
        uint256 successfulRentals;   // Successful completed rentals
        uint256 violations;         // Number of violations
        uint256 earlyRevokes;       // Number of early revokes
        uint256 rating;             // Reputation score (0-1000)
        uint256 lastActivity;       // Last activity timestamp
        bool isBlacklisted;         // Blacklist status
        uint256 blacklistUntil;     // Blacklist expiration
    }
    
    struct Violation {
        address reporter;           // Who reported the violation
        address violator;           // Who committed the violation
        uint256 rentalId;          // Related rental ID
        string reason;             // Reason for violation
        uint256 timestamp;         // When violation occurred
        bool resolved;             // Whether violation is resolved
    }
    
    // User reputation mapping
    mapping(address => UserReputation) public userReputation;
    
    // Violations tracking
    mapping(uint256 => Violation) public violations;
    uint256 public violationCount;
    
    // Constants
    uint256 public constant MAX_RATING = 1000;
    uint256 public constant MIN_RATING = 0;
    uint256 public constant VIOLATION_THRESHOLD = 3;      // Max violations before blacklist
    uint256 public constant BLACKLIST_DURATION = 7 days; // Blacklist duration
    uint256 public constant COOLDOWN_PERIOD = 1 hours;   // Cooldown between revokes
    
    // Events
    event ReputationUpdated(address indexed user, uint256 newRating);
    event ViolationReported(uint256 indexed violationId, address indexed reporter, address indexed violator, string reason);
    event UserBlacklisted(address indexed user, uint256 until);
    event UserUnblacklisted(address indexed user);
    event ViolationResolved(uint256 indexed violationId, bool approved);
    
    constructor() {}
    
    /**
     * @dev Update reputation after successful rental completion
     */
    function updateSuccessfulRental(address user) external onlyOwner {
        UserReputation storage rep = userReputation[user];
        rep.totalRentals++;
        rep.successfulRentals++;
        rep.lastActivity = block.timestamp;
        
        // Calculate new rating
        uint256 newRating = calculateRating(rep);
        rep.rating = newRating;
        
        emit ReputationUpdated(user, newRating);
    }
    
    /**
     * @dev Record a violation
     */
    function reportViolation(
        address violator,
        uint256 rentalId,
        string memory reason
    ) external nonReentrant returns (uint256 violationId) {
        require(violator != address(0), "ReputationSystem: invalid violator");
        require(bytes(reason).length > 0, "ReputationSystem: reason required");
        
        violationId = violationCount++;
        violations[violationId] = Violation({
            reporter: msg.sender,
            violator: violator,
            rentalId: rentalId,
            reason: reason,
            timestamp: block.timestamp,
            resolved: false
        });
        
        emit ViolationReported(violationId, msg.sender, violator, reason);
    }
    
    /**
     * @dev Record early revoke (potential violation)
     */
    function recordEarlyRevoke(address user, uint256 rentalId) external onlyOwner {
        UserReputation storage rep = userReputation[user];
        rep.earlyRevokes++;
        rep.lastActivity = block.timestamp;
        
        // Check if user should be blacklisted
        if (rep.earlyRevokes >= VIOLATION_THRESHOLD) {
            blacklistUser(user);
        }
        
        // Update rating
        uint256 newRating = calculateRating(rep);
        rep.rating = newRating;
        
        emit ReputationUpdated(user, newRating);
    }
    
    /**
     * @dev Blacklist a user
     */
    function blacklistUser(address user) internal {
        UserReputation storage rep = userReputation[user];
        rep.isBlacklisted = true;
        rep.blacklistUntil = block.timestamp + BLACKLIST_DURATION;
        
        emit UserBlacklisted(user, rep.blacklistUntil);
    }
    
    /**
     * @dev Unblacklist a user (only after blacklist period)
     */
    function unblacklistUser(address user) external onlyOwner {
        UserReputation storage rep = userReputation[user];
        require(rep.isBlacklisted, "ReputationSystem: user not blacklisted");
        require(block.timestamp >= rep.blacklistUntil, "ReputationSystem: blacklist period not expired");
        
        rep.isBlacklisted = false;
        rep.blacklistUntil = 0;
        
        emit UserUnblacklisted(user);
    }
    
    /**
     * @dev Resolve a violation (DAO or admin decision)
     */
    function resolveViolation(uint256 violationId, bool approved) external onlyOwner {
        require(violationId < violationCount, "ReputationSystem: invalid violation ID");
        
        Violation storage violation = violations[violationId];
        require(!violation.resolved, "ReputationSystem: violation already resolved");
        
        violation.resolved = true;
        
        if (approved) {
            // Violation confirmed, update violator's reputation
            UserReputation storage rep = userReputation[violation.violator];
            rep.violations++;
            rep.rating = calculateRating(rep);
            
            // Check for blacklist
            if (rep.violations >= VIOLATION_THRESHOLD) {
                blacklistUser(violation.violator);
            }
        }
        
        emit ViolationResolved(violationId, approved);
    }
    
    /**
     * @dev Calculate reputation rating
     */
    function calculateRating(UserReputation memory rep) internal pure returns (uint256) {
        if (rep.totalRentals == 0) {
            return 500; // Neutral rating for new users
        }
        
        // Base rating from success rate
        uint256 successRate = (rep.successfulRentals * 1000) / rep.totalRentals;
        
        // Penalty for violations
        uint256 violationPenalty = rep.violations * 100;
        uint256 earlyRevokePenalty = rep.earlyRevokes * 50;
        
        // Calculate final rating
        uint256 rating = successRate - violationPenalty - earlyRevokePenalty;
        
        // Ensure rating is within bounds
        if (rating > MAX_RATING) rating = MAX_RATING;
        if (rating < MIN_RATING) rating = MIN_RATING;
        
        return rating;
    }
    
    /**
     * @dev Check if user can perform action (not blacklisted, good reputation)
     */
    function canPerformAction(address user) external view returns (bool) {
        UserReputation storage rep = userReputation[user];
        
        // Check blacklist
        if (rep.isBlacklisted) {
            if (block.timestamp < rep.blacklistUntil) {
                return false;
            }
        }
        
        // Check minimum rating
        return rep.rating >= 300; // Minimum rating threshold
    }
    
    /**
     * @dev Get user reputation
     */
    function getUserReputation(address user) external view returns (UserReputation memory) {
        return userReputation[user];
    }
    
    /**
     * @dev Get violation details
     */
    function getViolation(uint256 violationId) external view returns (Violation memory) {
        require(violationId < violationCount, "ReputationSystem: invalid violation ID");
        return violations[violationId];
    }
    
    /**
     * @dev Check cooldown period for user
     */
    function canRevokeNow(address user) external view returns (bool) {
        UserReputation storage rep = userReputation[user];
        return block.timestamp >= rep.lastActivity + COOLDOWN_PERIOD;
    }
    
    /**
     * @dev Emergency function to reset user reputation (only owner)
     */
    function resetUserReputation(address user) external onlyOwner {
        delete userReputation[user];
    }
}
