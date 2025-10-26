const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying RecipeRegistry with ERC1155Holder...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const RecipeRegistry = await hre.ethers.getContractFactory("RecipeRegistry");
  const recipeRegistry = await RecipeRegistry.deploy();
  await recipeRegistry.waitForDeployment();

  const address = await recipeRegistry.getAddress();
  console.log("✅ RecipeRegistry deployed to:", address);
  
  // Fund the contract
  console.log("💰 Funding RecipeRegistry...");
  
  const usageRightsAddress = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";
  const usageRights = await hre.ethers.getContractAt("UsageRights1155", usageRightsAddress);
  
  // Transfer 10 Blessed Shields to RecipeRegistry
  const transferTx = await usageRights.safeTransferFrom(
    deployer.address, 
    address, 
    42, // Blessed Shield ID
    10, // Amount
    "0x" // Empty data
  );
  await transferTx.wait();
  console.log("✅ RecipeRegistry funded with 10 Blessed Shields");
  
  console.log("🎉 Deployment completed!");
  console.log("📍 New RecipeRegistry address:", address);
  console.log("💡 Update your frontend addresses.ts with this new address!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
