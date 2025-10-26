// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IRecipeRegistry.sol";
import "./interfaces/IUsageRights1155.sol";

/**
 * @title RecipeRegistry
 * @dev On-chain crafting system with recipes
 * ИСПРАВЛЕНО: Добавлена функция adminMint для owner'a
 */
contract RecipeRegistry is IRecipeRegistry, ERC1155Holder, Ownable, ReentrancyGuard {
    mapping(uint256 => Recipe) private recipes;
    uint256 private recipeCount;
    
    // Адрес контракта UsageRights1155
    address public immutable usageRights1155;

    constructor(address _usageRights1155) {
        require(_usageRights1155 != address(0), "Invalid token address");
        usageRights1155 = _usageRights1155;
    }

    /**
     * @dev ✅ НОВАЯ ФУНКЦИЯ: AdminMint
     * Позволяет owner контракта mint предметы через UsageRights1155
     */
    function adminMint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        IUsageRights1155(usageRights1155).mint(to, id, amount, data);
    }

    /**
     * @dev ✅ НОВАЯ ФУНКЦИЯ: Batch adminMint
     */
    function adminMintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyOwner {
        IUsageRights1155(usageRights1155).mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Register a new crafting recipe
     */
    function registerRecipe(
        Ingredient[] calldata inputs,
        address outputToken,
        uint256 outputId,
        uint256 outputAmount
    ) external onlyOwner {
        require(inputs.length > 0, "RecipeRegistry: inputs required");
        require(outputToken != address(0), "RecipeRegistry: invalid output token");
        require(outputAmount > 0, "RecipeRegistry: invalid output amount");

        Recipe storage recipe = recipes[recipeCount];
        
        for (uint256 i = 0; i < inputs.length; i++) {
            recipe.inputs.push(inputs[i]);
        }
        
        recipe.outputToken = outputToken;
        recipe.outputId = outputId;
        recipe.outputAmount = outputAmount;
        recipe.active = true;

        emit RecipeAdded(
            recipeCount,
            inputs,
            outputToken,
            outputId,
            outputAmount
        );

        recipeCount++;
    }

    /**
     * @dev Craft an item using a recipe
     */
    function craft(uint256 recipeId, address receiver) external nonReentrant {
        require(recipeId < recipeCount, "RecipeRegistry: invalid recipe ID");
        require(receiver != address(0), "RecipeRegistry: invalid receiver");
        
        Recipe storage recipe = recipes[recipeId];
        require(recipe.active, "RecipeRegistry: recipe not active");

        // Burn input ingredients
        for (uint256 i = 0; i < recipe.inputs.length; i++) {
            Ingredient memory ingredient = recipe.inputs[i];
            
            // Transfer ingredients from crafter to this contract (they will be burned)
            IERC1155(ingredient.token).safeTransferFrom(
                msg.sender,
                address(this),
                ingredient.id,
                ingredient.amount,
                ""
            );
        }

        // Mint output item
        IUsageRights1155(recipe.outputToken).mint(
            receiver,
            recipe.outputId,
            recipe.outputAmount,
            ""
        );

        emit Crafted(
            msg.sender,
            recipeId,
            recipe.outputToken,
            recipe.outputId,
            recipe.outputAmount
        );
    }

    /**
     * @dev Toggle recipe active status
     */
    function toggleRecipe(uint256 recipeId) external onlyOwner {
        require(recipeId < recipeCount, "RecipeRegistry: invalid recipe ID");
        recipes[recipeId].active = !recipes[recipeId].active;
    }

    /**
     * @dev Fund the contract with tokens for rewards
     */
    function fundRecipe(address token, uint256 id, uint256 amount) external {
        IERC1155(token).safeTransferFrom(msg.sender, address(this), id, amount, "");
        emit RecipeFunded(token, id, amount);
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw(address token, uint256 id, uint256 amount) external onlyOwner {
        IERC1155(token).safeTransferFrom(address(this), msg.sender, id, amount, "");
    }

    /**
     * @dev Get recipe by ID
     */
    function getRecipe(uint256 recipeId) external view returns (Recipe memory) {
        require(recipeId < recipeCount, "RecipeRegistry: invalid recipe ID");
        return recipes[recipeId];
    }

    /**
     * @dev Get recipe count
     */
    function getRecipeCount() external view returns (uint256) {
        return recipeCount;
    }

    /**
     * @dev Get all recipes
     */
    function getAllRecipes() external view returns (Recipe[] memory) {
        Recipe[] memory allRecipes = new Recipe[](recipeCount);
        for (uint256 i = 0; i < recipeCount; i++) {
            allRecipes[i] = recipes[i];
        }
        return allRecipes;
    }
}

