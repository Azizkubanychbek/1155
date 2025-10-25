// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IRentalEscrow
 * @dev Interface for rental escrow system
 */
interface IRentalEscrow {
    struct Rental {
        address lender;
        address borrower;
        address token;
        uint256 id;
        uint256 amount;
        uint64 expires;
        uint256 deposit;
        bool completed;
        bool penalized;
    }

    /**
     * @dev Emitted when a rental is created
     * @param rentalId The rental ID
     * @param lender The lender address
     * @param borrower The borrower address
     * @param token The token address
     * @param id The token ID
     * @param amount The amount
     * @param expires The expiration timestamp
     * @param deposit The deposit amount
     */
    event RentalCreated(
        uint256 indexed rentalId,
        address indexed lender,
        address indexed borrower,
        address token,
        uint256 id,
        uint256 amount,
        uint64 expires,
        uint256 deposit
    );

    /**
     * @dev Emitted when a rental is completed
     * @param rentalId The rental ID
     * @param borrower The borrower address
     * @param depositReturned The amount returned to borrower
     */
    event RentalCompleted(
        uint256 indexed rentalId,
        address indexed borrower,
        uint256 depositReturned
    );

    /**
     * @dev Emitted when a rental is penalized
     * @param rentalId The rental ID
     * @param lender The lender address
     * @param penaltyAmount The penalty amount
     */
    event RentalPenalized(
        uint256 indexed rentalId,
        address indexed lender,
        uint256 penaltyAmount
    );

    /**
     * @dev Create a new rental
     * @param lender The lender address
     * @param borrower The borrower address
     * @param token The token address
     * @param id The token ID
     * @param amount The amount
     * @param expires The expiration timestamp
     * @param deposit The deposit amount
     * @return rentalId The created rental ID
     */
    function createRental(
        address lender,
        address borrower,
        address token,
        uint256 id,
        uint256 amount,
        uint64 expires,
        uint256 deposit
    ) external payable returns (uint256 rentalId);

    /**
     * @dev Complete a rental and return deposit
     * @param rentalId The rental ID
     */
    function completeRental(uint256 rentalId) external;

    /**
     * @dev Penalize a rental (for violations)
     * @param rentalId The rental ID
     */
    function penalize(uint256 rentalId) external;

    /**
     * @dev Get rental details
     * @param rentalId The rental ID
     * @return The rental data
     */
    function getRental(uint256 rentalId) external view returns (Rental memory);

    /**
     * @dev Get the total number of rentals
     * @return The total number of rentals
     */
    function getRentalCount() external view returns (uint256);
}
