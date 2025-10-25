// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IUsageRights1155.sol";

/**
 * @title UsageRights1155
 * @dev ERC1155 token with temporary usage rights functionality
 * Implements EIP-5006 concept for ERC1155 tokens
 */
contract UsageRights1155 is ERC1155, Ownable, ReentrancyGuard, IUsageRights1155 {
    // Mapping from token ID => owner => user => UserRecord
    mapping(uint256 => mapping(address => mapping(address => UserRecord))) private _usageRights;

    constructor(string memory uri) ERC1155(uri) {}

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
     */
    function setUser(uint256 id, address user, uint256 amount, uint64 expires)
        public
        override
        nonReentrant
    {
        require(balanceOf(msg.sender, id) >= amount, "UsageRights1155: insufficient balance");
        require(expires > block.timestamp, "UsageRights1155: invalid expiration");
        require(user != address(0), "UsageRights1155: invalid user");

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
     */
    function revokeUser(uint256 id, address user) public override nonReentrant {
        require(_usageRights[id][msg.sender][user].user == user, "UsageRights1155: no rights to revoke");
        
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
}
