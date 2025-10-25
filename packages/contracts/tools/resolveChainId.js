const { ethers } = require("ethers");

async function main() {
  console.log('🔍 Resolving chain ID from Xsolla ZK Sepolia RPC...');
  
  try {
    const rpcUrl = process.env.XSOLLA_ZK_SEPOLIA_RPC || "https://sepolia.xsolla-zk.com";
    
    console.log('RPC URL:', rpcUrl);
    
    // Создаем провайдер для подключения к RPC
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Получаем chainId
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    console.log('✅ Chain ID resolved:', chainId);
    console.log('📝 Add this to your .env file:');
    console.log(`XSOLLA_ZK_CHAIN_ID=${chainId}`);
    
    // Также выводим для фронтенда
    console.log('📝 Add this to your frontend .env.local file:');
    console.log(`NEXT_PUBLIC_CHAIN_ID=${chainId}`);
    
  } catch (error) {
    console.error('❌ Failed to resolve chain ID:', error);
    console.error('Please check your RPC URL and network connectivity');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
