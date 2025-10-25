// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IUsageRights1155
 * @dev Interface for temporary usage rights on ERC1155 tokens
 * Based on EIP-5006 concept but adapted for ERC1155
 */
interface IUsageRights1155 {
    struct UserRecord {
        address user;
        uint64 expires;
        uint256 amountGranted;
    }

    /**
     * @dev Emitted when usage rights are updated
     * @param owner The token owner
     * @param user The user granted rights
     * @param id The token ID
     * @param amount The amount of tokens
     * @param expires The expiration timestamp
     */
    event UpdateUser(
        address indexed owner,
        address indexed user,
        uint256 indexed id,
        uint256 amount,
        uint64 expires
    );

    /**
     * @dev Get the current user and expiration for a token
     * @param id The token ID
     * @param owner The token owner
     * @return user The current user
     * @return expires The expiration timestamp
     * @return amountGranted The amount granted to the user
     */
    function userOf(uint256 id, address owner)
        external
        view
        returns (
            address user,
            uint64 expires,
            uint256 amountGranted
        );

    /**
     * @dev Check if a user has active usage rights
     * @param id The token ID
     * @param owner The token owner
     * @param user The user to check
     * @return True if the user has active rights
     */
    function isUserActive(uint256 id, address owner, address user)
        external
        view
        returns (bool);

    /**
     * @dev Set usage rights for a token
     * @param id The token ID
     * @param user The user to grant rights to
     * @param amount The amount of tokens
     * @param expires The expiration timestamp
     */
    function setUser(uint256 id, address user, uint256 amount, uint64 expires)
        external;

    /**
     * @dev Revoke usage rights for a token
     * @param id The token ID
     * @param user The user to revoke rights from
     */
    function revokeUser(uint256 id, address user) external;
}
