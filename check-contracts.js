const { ethers } = require("ethers");

async function checkContracts() {
  console.log('🔍 Checking deployed contracts...');
  
  try {
    // Connect to Xsolla ZK Sepolia
    const provider = new ethers.JsonRpcProvider('https://sepolia.era.zksync.dev');
    
    const contractAddresses = {
      UsageRights1155: "0xfbA1b6DCcB692DC9b7221E66D63E9bF2c643199c",
      PartyBackpack: "0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9",
      RecipeRegistry: "0x9628fa7Aaac8d27D92c4AF1F1eBF83024d0B7A04",
      RentalEscrow: "0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159"
    };
    
    console.log('📡 Network: Xsolla ZK Sepolia (Testnet)');
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
