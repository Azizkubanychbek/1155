require('dotenv').config();
const fs = require('fs');
const path = require('path');

const DEPLOYMENTS_PATH = path.join(__dirname, '..', 'deployments-zk', 'zkSyncSepolia', 'contracts');
const FRONTEND_ENV_PATH = path.join(__dirname, '..', '..', 'frontend', '.env.local');

async function getAddresses() {
    console.log('📋 Contract Addresses:');
    const addresses = {};

    const contractNames = ["UsageRights1155", "PartyBackpack", "RecipeRegistry", "RentalEscrow"];

    for (const name of contractNames) {
        const contractDir = path.join(DEPLOYMENTS_PATH, `${name}.sol`);
        const contractFile = path.join(contractDir, `${name}.json`);
        
        if (fs.existsSync(contractFile)) {
            const deployment = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
            addresses[name] = deployment.entries[0].address;
            console.log(`${name}: ${addresses[name]}`);
        } else {
            addresses[name] = "Not deployed";
            console.log(`${name}: Not deployed`);
        }
    }

    // Update frontend .env.local
    let frontendEnvContent = `NEXT_PUBLIC_XSOLLA_ZK_RPC=https://sepolia.era.zksync.dev
NEXT_PUBLIC_CHAIN_ID=300
NEXT_PUBLIC_USAGE_RIGHTS_ADDRESS=${addresses.UsageRights1155}
NEXT_PUBLIC_PARTY_BACKPACK_ADDRESS=${addresses.PartyBackpack}
NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS=${addresses.RecipeRegistry}
NEXT_PUBLIC_RENTAL_ESCROW_ADDRESS=${addresses.RentalEscrow}
`;

    fs.writeFileSync(FRONTEND_ENV_PATH, frontendEnvContent);
    console.log('\n📝 Frontend .env.local content:');
    console.log(frontendEnvContent);
    console.log('\n✅ Updated frontend/.env.local');
}

getAddresses().catch(console.error);
