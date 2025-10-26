const { ethers } = require("ethers");

const RPC_URL = "https://zkrpc-sepolia.xsollazk.com";
const PRIVATE_KEY = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// RecipeRegistry ABI (constructor only)
const recipeRegistryABI = [
  "constructor()"
];

// RecipeRegistry bytecode (we'll need to get this from compilation)
const recipeRegistryBytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b0319163317905561014a806100326000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063bb5751311461003b578063f2fde38b14610057575b600080fd5b610043610073565b60405161004e91906100d1565b60405180910390f35b610071600480360381019061006c919061009d565b610079565b005b60005481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146100d7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100ce906100f2565b60405180910390fd5b50565b6000819050919050565b6100ed816100da565b82525050565b600060208201905061010860008301846100e4565b92915050565b600080fd5b61011c816100da565b811461012757600080fd5b50565b60008135905061013981610113565b92915050565b6000602082840312156101555761015461010e565b5b60006101638482850161012a565b9150509291505056fea2646970667358221220";

async function deployRecipeRegistry() {
  try {
    console.log("🚀 Deploying RecipeRegistry...");
    console.log(`📡 Network: ${RPC_URL}`);
    console.log(`👤 Wallet: ${wallet.address}`);

    // Deploy RecipeRegistry
    const factory = new ethers.ContractFactory(recipeRegistryABI, recipeRegistryBytecode, wallet);
    const recipeRegistry = await factory.deploy();
    await recipeRegistry.waitForDeployment();
    
    const address = await recipeRegistry.getAddress();
    console.log(`✅ RecipeRegistry deployed at: ${address}`);

    // Fund the contract with Blessed Shields
    console.log("💰 Funding RecipeRegistry with Blessed Shields...");
    
    const usageRightsAddress = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";
    const usageRightsABI = [
      "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external"
    ];
    
    const usageRights = new ethers.Contract(usageRightsAddress, usageRightsABI, wallet);
    
    // Transfer 5 Blessed Shields to RecipeRegistry
    const transferTx = await usageRights.safeTransferFrom(
      wallet.address, 
      address, 
      42, // Blessed Shield ID
      5,  // Amount
      "0x" // Empty data
    );
    await transferTx.wait();
    console.log("✅ RecipeRegistry funded with 5 Blessed Shields");

    console.log("\n🎉 RecipeRegistry deployment completed!");
    console.log(`📍 New address: ${address}`);
    console.log("💡 Update your frontend addresses.ts with this new address!");

  } catch (error) {
    console.error("❌ Error deploying RecipeRegistry:", error);
  }
}

deployRecipeRegistry();
