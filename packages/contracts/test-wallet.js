require('dotenv').config();
const { Wallet } = require("zksync-ethers");

async function testWallet() {
  try {
    const privateKey = "cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c";
    console.log('Private key length:', privateKey.length);
    console.log('Private key starts with:', privateKey.substring(0, 10) + '...');
    
    const wallet = new Wallet(privateKey);
    console.log('Wallet address:', wallet.address);
    console.log('✅ Wallet created successfully');
  } catch (error) {
    console.error('❌ Error creating wallet:', error.message);
  }
}

testWallet();
