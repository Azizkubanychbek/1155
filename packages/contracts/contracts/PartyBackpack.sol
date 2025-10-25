// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./interfaces/IPartyBackpack.sol";
import "./interfaces/IUsageRights1155.sol";

/**
 * @title PartyBackpack
 * @dev Shared inventory system for parties/guilds
 * Allows members to deposit items and grant usage rights to other members
 */
contract PartyBackpack is Ownable, ReentrancyGuard, ERC1155Holder, IPartyBackpack {
    IUsageRights1155 public immutable usageRightsToken;
    
    // Mapping from token ID => total balance in party backpack
    mapping(uint256 => uint256) private _partyBalances;
    
    // Mapping from token ID => number of active users
    mapping(uint256 => uint256) private _activeUsers;

    constructor(address _usageRightsToken) {
        usageRightsToken = IUsageRights1155(_usageRightsToken);
    }

    /**
     * @dev Deposit items to the party backpack
     */
    function deposit(uint256 id, uint256 amount) external override nonReentrant {
        require(amount > 0, "PartyBackpack: amount must be positive");
        
        IERC1155 token = IERC1155(address(usageRightsToken));
        require(token.balanceOf(msg.sender, id) >= amount, "PartyBackpack: insufficient balance");
        
        // Transfer tokens to this contract
        token.safeTransferFrom(msg.sender, address(this), id, amount, "");
        
        // Update party balance
        _partyBalances[id] += amount;
        
        emit PartyDeposit(msg.sender, id, amount);
    }

    /**
     * @dev Grant usage rights from party inventory
     */
    function grantUsage(address to, uint256 id, uint256 amount, uint64 expires)
        external
        override
        nonReentrant
        onlyOwner
    {
        require(to != address(0), "PartyBackpack: invalid user");
        require(amount > 0, "PartyBackpack: amount must be positive");
        require(_partyBalances[id] >= amount, "PartyBackpack: insufficient party balance");
        require(expires > block.timestamp, "PartyBackpack: invalid expiration");

        // Grant usage rights from this contract's tokens
        usageRightsToken.setUser(id, to, amount, expires);
        
        // Update active users count
        _activeUsers[id]++;
        
        emit PartyGrant(msg.sender, to, id, amount, expires);
    }

    /**
     * @dev Reclaim unused items from party inventory
     */
    function reclaim(uint256 id, uint256 amount) external override nonReentrant onlyOwner {
        require(amount > 0, "PartyBackpack: amount must be positive");
        require(_partyBalances[id] >= amount, "PartyBackpack: insufficient party balance");
        
        // Update party balance
        _partyBalances[id] -= amount;
        
        // Transfer tokens back to owner
        IERC1155 token = IERC1155(address(usageRightsToken));
        token.safeTransferFrom(address(this), owner(), id, amount, "");
        
        emit PartyReclaim(msg.sender, id, amount);
    }

    /**
     * @dev Get the number of active users for a token
     */
    function activeUsers(uint256 id) external view override returns (uint256) {
        return _activeUsers[id];
    }

    /**
     * @dev Get the balance of a token in the party backpack
     */
    function partyBalance(uint256 id) external view override returns (uint256) {
        return _partyBalances[id];
    }

    /**
     * @dev Override supportsInterface to include ERC1155Holder
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
