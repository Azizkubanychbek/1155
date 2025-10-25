// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./interfaces/IRecipeRegistry.sol";
import "./UsageRights1155.sol";

/**
 * @title RecipeRegistry
 * @dev On-chain crafting system with recipe management
 */
contract RecipeRegistry is Ownable, ReentrancyGuard, IRecipeRegistry {
    // Array of all recipes
    Recipe[] private _recipes;
    
    // Mapping from recipe ID => recipe
    mapping(uint256 => Recipe) private _recipeMap;
    
    // Total number of recipes
    uint256 private _recipeCount;

    constructor() {}

    /**
     * @dev Register a new crafting recipe
     */
    function registerRecipe(
        Ingredient[] calldata inputs,
        address outputToken,
        uint256 outputId,
        uint256 outputAmount
    ) external override onlyOwner {
        require(inputs.length > 0, "RecipeRegistry: inputs required");
        require(outputToken != address(0), "RecipeRegistry: invalid output token");
        require(outputAmount > 0, "RecipeRegistry: invalid output amount");

        Recipe memory newRecipe = Recipe({
            inputs: inputs,
            outputToken: outputToken,
            outputId: outputId,
            outputAmount: outputAmount,
            active: true
        });

        _recipes.push(newRecipe);
        _recipeMap[_recipeCount] = newRecipe;
        _recipeCount++;

        emit RecipeAdded(_recipeCount - 1, inputs, outputToken, outputId, outputAmount);
    }

    /**
     * @dev Craft an item using a recipe
     */
    function craft(uint256 recipeId, address receiver) external override nonReentrant {
        require(recipeId < _recipeCount, "RecipeRegistry: invalid recipe ID");
        require(receiver != address(0), "RecipeRegistry: invalid receiver");
        
        Recipe memory recipe = _recipeMap[recipeId];
        require(recipe.active, "RecipeRegistry: recipe not active");

        // Check and transfer input ingredients
        for (uint256 i = 0; i < recipe.inputs.length; i++) {
            Ingredient memory ingredient = recipe.inputs[i];
            IERC1155 token = IERC1155(ingredient.token);
            
            require(
                token.balanceOf(msg.sender, ingredient.id) >= ingredient.amount,
                "RecipeRegistry: insufficient ingredient balance"
            );
            
            // Transfer ingredient from crafter to this contract
            token.safeTransferFrom(msg.sender, address(this), ingredient.id, ingredient.amount, "");
        }

        // Mint or transfer output item
        if (recipe.outputToken == address(this)) {
            // If output is this contract's token, mint it
            UsageRights1155 outputToken = UsageRights1155(recipe.outputToken);
            outputToken.mint(receiver, recipe.outputId, recipe.outputAmount, "");
        } else {
            // If output is external token, it should have been pre-funded
            IERC1155 outputToken = IERC1155(recipe.outputToken);
            require(
                outputToken.balanceOf(address(this), recipe.outputId) >= recipe.outputAmount,
                "RecipeRegistry: insufficient output token balance"
            );
            outputToken.safeTransferFrom(address(this), receiver, recipe.outputId, recipe.outputAmount, "");
        }

        emit Crafted(msg.sender, recipeId, recipe.outputToken, recipe.outputId, recipe.outputAmount);
    }

    /**
     * @dev Get a recipe by ID
     */
    function getRecipe(uint256 recipeId) external view override returns (Recipe memory) {
        require(recipeId < _recipeCount, "RecipeRegistry: invalid recipe ID");
        return _recipeMap[recipeId];
    }

    /**
     * @dev Get the total number of recipes
     */
    function getRecipeCount() external view override returns (uint256) {
        return _recipeCount;
    }

    /**
     * @dev Get all recipes (for frontend)
     */
    function getAllRecipes() external view returns (Recipe[] memory) {
        return _recipes;
    }

    /**
     * @dev Toggle recipe active status
     */
    function toggleRecipe(uint256 recipeId) external onlyOwner {
        require(recipeId < _recipeCount, "RecipeRegistry: invalid recipe ID");
        _recipeMap[recipeId].active = !_recipeMap[recipeId].active;
    }
}
