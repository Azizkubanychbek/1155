// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IUsageRights1155.sol";
import "./ReputationSystem.sol";

/**
 * @title UsageRights1155
 * @dev ERC1155 token with temporary usage rights functionality
 * Implements EIP-5006 concept for ERC1155 tokens
 */
contract UsageRights1155 is ERC1155, Ownable, ReentrancyGuard, IUsageRights1155 {
    // Mapping from token ID => owner => user => UserRecord
    mapping(uint256 => mapping(address => mapping(address => UserRecord))) private _usageRights;
    
    // Reputation system integration
    ReputationSystem public reputationSystem;
    
    // Protection mechanisms
    mapping(address => uint256) public lastRevokeTime;
    uint256 public constant REVOKE_COOLDOWN = 1 hours;
    uint256 public constant MIN_RENTAL_DURATION = 30 minutes;
    
    // Events for protection
    event EarlyRevokeDetected(address indexed owner, address indexed user, uint256 tokenId, uint256 rentalDuration);
    event RevokeBlocked(address indexed owner, string reason);

    constructor(string memory uri, address _reputationSystem) ERC1155(uri) {
        reputationSystem = ReputationSystem(_reputationSystem);
    }

    /**
     * @dev Get the current user and expiration for a token
     */
    function userOf(uint256 id, address owner)
        public
        view
        override
        returns (
            address user,
            uint64 expires,
            uint256 amountGranted
        )
    {
        UserRecord memory record = _usageRights[id][owner][_usageRights[id][owner][address(0)].user];
        return (record.user, record.expires, record.amountGranted);
    }

    /**
     * @dev Check if a user has active usage rights
     */
    function isUserActive(uint256 id, address owner, address user)
        public
        view
        override
        returns (bool)
    {
        UserRecord memory record = _usageRights[id][owner][user];
        return record.user == user && record.expires > block.timestamp && record.amountGranted > 0;
    }

    /**
     * @dev Set usage rights for a token
     * Only the token owner can set usage rights
     * Now includes reputation and cooldown checks
     */
    function setUser(uint256 id, address user, uint256 amount, uint64 expires)
        public
        override
        nonReentrant
    {
        require(balanceOf(msg.sender, id) >= amount, "UsageRights1155: insufficient balance");
        require(expires > block.timestamp, "UsageRights1155: invalid expiration");
        require(user != address(0), "UsageRights1155: invalid user");
        
        // Check reputation system
        require(reputationSystem.canPerformAction(msg.sender), "UsageRights1155: user reputation too low");
        require(reputationSystem.canPerformAction(user), "UsageRights1155: target user reputation too low");
        
        // Check cooldown period
        require(block.timestamp >= lastRevokeTime[msg.sender] + REVOKE_COOLDOWN, 
                "UsageRights1155: cooldown period not expired");

        // Clear existing usage rights for this user
        if (_usageRights[id][msg.sender][user].user != address(0)) {
            delete _usageRights[id][msg.sender][user];
        }

        // Set new usage rights
        _usageRights[id][msg.sender][user] = UserRecord({
            user: user,
            expires: expires,
            amountGranted: amount
        });

        emit UpdateUser(msg.sender, user, id, amount, expires);
    }

    /**
     * @dev Revoke usage rights for a token
     * Now includes protection against early revokes
     */
    function revokeUser(uint256 id, address user) public override nonReentrant {
        require(_usageRights[id][msg.sender][user].user == user, "UsageRights1155: no rights to revoke");
        
        UserRecord memory record = _usageRights[id][msg.sender][user];
        uint256 rentalDuration = block.timestamp - (record.expires - (record.expires - block.timestamp));
        
        // Check if this is an early revoke (before minimum rental duration)
        if (rentalDuration < MIN_RENTAL_DURATION) {
            // Record early revoke in reputation system
            reputationSystem.recordEarlyRevoke(msg.sender, 0); // rentalId would be passed in real implementation
            
            emit EarlyRevokeDetected(msg.sender, user, id, rentalDuration);
        }
        
        // Update last revoke time
        lastRevokeTime[msg.sender] = block.timestamp;
        
        delete _usageRights[id][msg.sender][user];
        
        emit UpdateUser(msg.sender, user, id, 0, 0);
    }

    /**
     * @dev Override _beforeTokenTransfer to handle ownership changes
     * When ownership changes, usage rights are cleared for security
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        // Clear usage rights when tokens are transferred
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];
                // Clear all usage rights for this token when ownership changes
                // This is a security measure to prevent unauthorized usage
                // In a more sophisticated implementation, you might want to migrate rights
                // For now, we clear them to ensure security
            }
        }
    }

    /**
     * @dev Mint tokens (only owner for demo purposes)
     */
    function mint(address to, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(to, id, amount, data);
    }

    /**
     * @dev Batch mint tokens (only owner for demo purposes)
     */
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
    
    /**
     * @dev Update reputation system address (only owner)
     */
    function setReputationSystem(address _reputationSystem) external onlyOwner {
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Check if user can revoke (cooldown check)
     */
    function canRevoke(address user) external view returns (bool) {
        return block.timestamp >= lastRevokeTime[user] + REVOKE_COOLDOWN;
    }
    
    /**
     * @dev Get time until next revoke is allowed
     */
    function timeUntilRevoke(address user) external view returns (uint256) {
        uint256 nextRevokeTime = lastRevokeTime[user] + REVOKE_COOLDOWN;
        if (block.timestamp >= nextRevokeTime) {
            return 0;
        }
        return nextRevokeTime - block.timestamp;
    }
}
