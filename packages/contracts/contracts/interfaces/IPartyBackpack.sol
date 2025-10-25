// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPartyBackpack
 * @dev Interface for party/guild shared inventory
 */
interface IPartyBackpack {
    /**
     * @dev Emitted when items are deposited to the party backpack
     * @param depositor The address that deposited
     * @param tokenId The token ID
     * @param amount The amount deposited
     */
    event PartyDeposit(
        address indexed depositor,
        uint256 indexed tokenId,
        uint256 amount
    );

    /**
     * @dev Emitted when usage rights are granted from party inventory
     * @param grantor The address granting rights
     * @param user The user receiving rights
     * @param tokenId The token ID
     * @param amount The amount granted
     * @param expires The expiration timestamp
     */
    event PartyGrant(
        address indexed grantor,
        address indexed user,
        uint256 indexed tokenId,
        uint256 amount,
        uint64 expires
    );

    /**
     * @dev Emitted when items are reclaimed from party inventory
     * @param reclaimer The address reclaiming items
     * @param tokenId The token ID
     * @param amount The amount reclaimed
     */
    event PartyReclaim(
        address indexed reclaimer,
        uint256 indexed tokenId,
        uint256 amount
    );

    /**
     * @dev Deposit items to the party backpack
     * @param id The token ID
     * @param amount The amount to deposit
     */
    function deposit(uint256 id, uint256 amount) external;

    /**
     * @dev Grant usage rights from party inventory
     * @param to The user to grant rights to
     * @param id The token ID
     * @param amount The amount to grant
     * @param expires The expiration timestamp
     */
    function grantUsage(address to, uint256 id, uint256 amount, uint64 expires)
        external;

    /**
     * @dev Reclaim unused items from party inventory
     * @param id The token ID
     * @param amount The amount to reclaim
     */
    function reclaim(uint256 id, uint256 amount) external;

    /**
     * @dev Get the number of active users for a token
     * @param id The token ID
     * @return The number of active users
     */
    function activeUsers(uint256 id) external view returns (uint256);

    /**
     * @dev Get the balance of a token in the party backpack
     * @param id The token ID
     * @return The balance
     */
    function partyBalance(uint256 id) external view returns (uint256);
}
