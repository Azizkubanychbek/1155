const { ethers } = require("ethers");

async function checkContracts() {
  console.log('🔍 Checking deployed contracts...');
  
  try {
    // Connect to zkSync Sepolia
    const provider = new ethers.JsonRpcProvider('https://sepolia.era.zksync.dev');
    
    const contractAddresses = {
      UsageRights1155: "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1", // NEW
      PartyBackpack: "0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9",
      RecipeRegistry: "0xde41e18E60446f61B7cfc08139D39860CF6eE64D", // NEW
      RentalEscrow: "0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159"
    };
    
    console.log('📡 Network: zkSync Sepolia (Testnet)');
    console.log('🌐 RPC: https://sepolia.era.zksync.dev');
    console.log('🔗 Chain ID: 300');
    console.log('');
    
    for (const [name, address] of Object.entries(contractAddresses)) {
      try {
        const code = await provider.getCode(address);
        if (code && code !== '0x') {
          console.log(`✅ ${name}: ${address} (Deployed)`);
        } else {
          console.log(`❌ ${name}: ${address} (Not deployed)`);
        }
      } catch (error) {
        console.log(`❌ ${name}: ${address} (Error: ${error.message})`);
      }
    }
    
    console.log('');
    console.log('🎮 Your contracts are ready for testing!');
    console.log('💡 Open http://localhost:3000 and start playing!');
    
  } catch (error) {
    console.error('❌ Error checking contracts:', error);
  }
}

checkContracts();
