import { expect } from "chai";
import { ethers } from "hardhat";
import { RecipeRegistry } from "../typechain-types";
import { UsageRights1155 } from "../typechain-types";

describe("RecipeRegistry", function () {
  let usageRights: UsageRights1155;
  let recipeRegistry: RecipeRegistry;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    // Deploy UsageRights1155 first
    const UsageRights1155Factory = await ethers.getContractFactory("UsageRights1155");
    usageRights = await UsageRights1155Factory.deploy("https://api.backpackguilds.com/metadata/");
    await usageRights.waitForDeployment();
    
    // Deploy RecipeRegistry
    const RecipeRegistryFactory = await ethers.getContractFactory("RecipeRegistry");
    recipeRegistry = await RecipeRegistryFactory.deploy();
    await recipeRegistry.waitForDeployment();
    
    // Mint some tokens to user1
    await usageRights.mint(user1.address, 1, 100, "0x"); // Sword
    await usageRights.mint(user1.address, 2, 50, "0x");  // Shield
    await usageRights.mint(user1.address, 3, 200, "0x");  // Herb
  });

  describe("Recipe management", function () {
    it("Should register recipe correctly", async function () {
      const ingredients = [
        {
          token: await usageRights.getAddress(),
          id: 3, // Herb
          amount: 3
        },
        {
          token: await usageRights.getAddress(),
          id: 2, // Shield
          amount: 1
        }
      ];
      
      await recipeRegistry.registerRecipe(
        ingredients,
        await usageRights.getAddress(),
        42, // Blessed Shield
        1
      );
      
      expect(await recipeRegistry.getRecipeCount()).to.equal(1);
    });

    it("Should craft item correctly", async function () {
      // Register recipe first
      const ingredients = [
        {
          token: await usageRights.getAddress(),
          id: 3, // Herb
          amount: 3
        },
        {
          token: await usageRights.getAddress(),
          id: 2, // Shield
          amount: 1
        }
      ];
      
      await recipeRegistry.registerRecipe(
        ingredients,
        await usageRights.getAddress(),
        42, // Blessed Shield
        1
      );
      
      // Approve recipe registry to spend tokens
      await usageRights.connect(user1).setApprovalForAll(await recipeRegistry.getAddress(), true);
      
      // Craft the item
      await recipeRegistry.connect(user1).craft(0, user1.address);
      
      // Check that ingredients were consumed and output was created
      expect(await usageRights.balanceOf(user1.address, 3)).to.equal(197); // 200 - 3
      expect(await usageRights.balanceOf(user1.address, 2)).to.equal(49);  // 50 - 1
      expect(await usageRights.balanceOf(user1.address, 42)).to.equal(1);  // Blessed Shield
    });
  });
});
