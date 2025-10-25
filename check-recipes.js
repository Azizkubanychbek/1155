const { ethers } = require('ethers');

async function checkRecipes() {
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia.era.zksync.dev');
    const contractAddress = '0x9628fa7Aaac8d27D92c4AF1F1eBF83024d0B7A04';
    
    const abi = [
      'function getAllRecipes() view returns (tuple(tuple(address token, uint256 id, uint256 amount)[] inputs, address outputToken, uint256 outputId, uint256 outputAmount, bool active)[])',
      'function getRecipeCount() view returns (uint256)'
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    console.log('Checking contract at:', contractAddress);
    
    const count = await contract.getRecipeCount();
    console.log('Recipe count:', count.toString());
    
    const recipes = await contract.getAllRecipes();
    console.log('Recipes found:', recipes.length);
    
    recipes.forEach((recipe, index) => {
      console.log(`\nRecipe ${index}:`);
      console.log('  Inputs:', recipe.inputs.map(i => ({ 
        id: i.id.toString(), 
        amount: i.amount.toString() 
      })));
      console.log('  Output ID:', recipe.outputId.toString());
      console.log('  Output Amount:', recipe.outputAmount.toString());
      console.log('  Active:', recipe.active);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRecipes();
