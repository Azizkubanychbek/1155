const { Wallet, Provider } = require("zksync-ethers");
const { ethers } = require("ethers");

async function main() {
  console.log("🔑 Transferring ownership of contracts...\n");

  // Initialize provider
  const provider = new Provider("https://sepolia.era.zksync.dev");
  
  // Initialize wallet
  const privateKey = "0xcbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
  const wallet = new Wallet(privateKey, provider);
  console.log(`📝 Using wallet: ${wallet.address}`);
  
  // Contract addresses
  const recipeRegistryAddress = "0x47f5e7968D0E6FFf98965A5806B8Fdff21e6f871";
  
  // Ownable ABI
  const ownableABI = [
    "function owner() view returns (address)",
    "function transferOwnership(address newOwner) external"
  ];
  
  const recipeRegistry = new ethers.Contract(recipeRegistryAddress, ownableABI, wallet);
  
  try {
    // Check current owner
    const currentOwner = await recipeRegistry.owner();
    console.log(`📊 Current owner: ${currentOwner}`);
    console.log(`📊 Our address: ${wallet.address}`);
    
    if (currentOwner.toLowerCase() === wallet.address.toLowerCase()) {
      console.log("✅ We are already the owner!");
    } else {
      console.log("❌ We are not the owner. Need to transfer ownership.");
      console.log("💡 This requires the current owner to call transferOwnership()");
    }
    
  } catch (error) {
    console.error("❌ Error checking ownership:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
