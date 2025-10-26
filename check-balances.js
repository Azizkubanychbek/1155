const { ethers } = require("ethers");

async function checkBalances() {
  console.log('🎮 Checking item balances...');
  
  try {
    // Connect to Xsolla ZK Sepolia Testnet
    const provider = new ethers.JsonRpcProvider('https://zkrpc-sepolia.xsollazk.com');
    
    // Contract address (new deployment)
    const contractAddress = "0x9E270e38Bf69Bf35B3279B9f4A6fA66C584A83A1";
    
    // Your wallet address
    const walletAddress = "0xB468B3837e185B59594A100c1583a98C79b524F3";
    
    // Item IDs and names
    const items = [
      { id: 1, name: 'Sword' },
      { id: 2, name: 'Shield' },
      { id: 3, name: 'Herb' },
      { id: 4, name: 'Potion' },
      { id: 42, name: 'Blessed Shield' }
    ];
    
    console.log('📡 Network: Xsolla ZK Sepolia (Testnet)');
    console.log('🏗️ Contract: ' + contractAddress);
    console.log('👤 Wallet: ' + walletAddress);
    console.log('');
    
    // Get contract ABI for balanceOf function
    const contract = new ethers.Contract(contractAddress, [
      "function balanceOf(address account, uint256 id) view returns (uint256)"
    ], provider);
    
    console.log('🎒 Your inventory:');
    console.log('─'.repeat(50));
    
    for (const item of items) {
      try {
        const balance = await contract.balanceOf(walletAddress, item.id);
        const balanceNumber = Number(balance);
        
        if (balanceNumber > 0) {
          console.log(`✅ ${item.name} (ID: ${item.id}): ${balanceNumber} pieces`);
        } else {
          console.log(`❌ ${item.name} (ID: ${item.id}): 0 pieces`);
        }
      } catch (error) {
        console.log(`❌ ${item.name} (ID: ${item.id}): Error - ${error.message}`);
      }
    }
    
    console.log('─'.repeat(50));
    console.log('');
    console.log('💡 To get more items:');
    console.log('   1. Open http://localhost:3000');
    console.log('   2. Go to Backpack page');
    console.log('   3. Use Item Faucet to mint items');
    console.log('   4. Or run: cd packages/contracts && pnpm mint:quick');
    
  } catch (error) {
    console.error('❌ Error checking balances:', error);
  }
}

checkBalances();
