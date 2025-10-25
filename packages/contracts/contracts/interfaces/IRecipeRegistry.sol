// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IRecipeRegistry
 * @dev Interface for on-chain crafting recipes
 */
interface IRecipeRegistry {
    struct Ingredient {
        address token;
        uint256 id;
        uint256 amount;
    }

    struct Recipe {
        Ingredient[] inputs;
        address outputToken;
        uint256 outputId;
        uint256 outputAmount;
        bool active;
    }

    /**
     * @dev Emitted when a new recipe is registered
     * @param recipeId The ID of the recipe
     * @param inputs The input ingredients
     * @param outputToken The output token address
     * @param outputId The output token ID
     * @param outputAmount The output amount
     */
    event RecipeAdded(
        uint256 indexed recipeId,
        Ingredient[] inputs,
        address outputToken,
        uint256 outputId,
        uint256 outputAmount
    );

    /**
     * @dev Emitted when an item is crafted
     * @param crafter The address that crafted the item
     * @param recipeId The recipe used
     * @param outputToken The output token address
     * @param outputId The output token ID
     * @param outputAmount The output amount
     */
    event Crafted(
        address indexed crafter,
        uint256 indexed recipeId,
        address outputToken,
        uint256 outputId,
        uint256 outputAmount
    );

    /**
     * @dev Register a new crafting recipe
     * @param inputs The input ingredients
     * @param outputToken The output token address
     * @param outputId The output token ID
     * @param outputAmount The output amount
     */
    function registerRecipe(
        Ingredient[] calldata inputs,
        address outputToken,
        uint256 outputId,
        uint256 outputAmount
    ) external;

    /**
     * @dev Craft an item using a recipe
     * @param recipeId The recipe ID to use
     * @param receiver The address to receive the crafted item
     */
    function craft(uint256 recipeId, address receiver) external;

    /**
     * @dev Get a recipe by ID
     * @param recipeId The recipe ID
     * @return The recipe data
     */
    function getRecipe(uint256 recipeId) external view returns (Recipe memory);

    /**
     * @dev Get the total number of recipes
     * @return The total number of recipes
     */
    function getRecipeCount() external view returns (uint256);
}
