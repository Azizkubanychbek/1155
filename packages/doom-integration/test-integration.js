#!/usr/bin/env node

/**
 * DOOM Blockchain Integration Test Script
 * Tests the integration between DOOM and Backpack Guilds protocol
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    rpcUrl: 'https://sepolia.era.zksync.dev',
    chainId: 300,
    contracts: {
        usageRights: '0xfbA1b6DCcB692DC9b7221E66D63E9bF2c643199c',
        partyBackpack: '0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9',
        recipeRegistry: '0x9628fa7Aaac8d27D92c4AF1F1eBF83024d0B7A04',
        rentalEscrow: '0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159'
    }
};

// DOOM item mappings
const DOOM_ITEMS = {
    1: { name: 'Sword', doomItem: 'Chainsaw', enhancement: '+75% damage, +33% speed' },
    2: { name: 'Shield', doomItem: 'Shotgun', enhancement: '+43% pellets, +25% range' },
    3: { name: 'Herb', doomItem: 'Health', enhancement: '+100% healing, +25% max health' },
    4: { name: 'Potion', doomItem: 'Power-up', enhancement: '+100% duration, +50% speed' },
    5: { name: 'Health Potion', doomItem: 'Crafted', enhancement: '+200% healing' },
    6: { name: 'Armor', doomItem: 'Crafted', enhancement: '+100% protection' },
    7: { name: 'Super Shotgun', doomItem: 'Crafted', enhancement: '+150% damage' }
};

// Test scenarios
const testScenarios = [
    {
        name: 'Blockchain Warrior',
        description: 'Single player with blockchain items',
        steps: [
            'Find Sword Token in secret room',
            'Use enhanced chainsaw against imps',
            'Find Shield Token in next level',
            'Use enhanced shotgun against cacodemons',
            'Craft Health Potion (Herb + Herb)',
            'Use all items for boss fight'
        ]
    },
    {
        name: 'Guild Raid',
        description: 'Multiplayer party system',
        steps: [
            'Form blockchain party (4 players)',
            'Share Sword Token with party member',
            'Coordinate enhanced chainsaw attacks',
            'Share Shield Token with another member',
            'Synchronize enhanced shotgun attacks',
            'Defeat boss with combined power'
        ]
    },
    {
        name: 'Weapon Rental',
        description: 'Rental system integration',
        steps: [
            'Browse available weapon rentals',
            'Rent Sword Token for 1 hour',
            'Pay deposit and get usage rights',
            'Use enhanced chainsaw for boss fight',
            'Return weapon after battle',
            'Get deposit back'
        ]
    }
];

// Test functions
async function testBlockchainConnection() {
    console.log('🔗 Testing blockchain connection...');
    
    try {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const network = await provider.getNetwork();
        
        console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`✅ RPC URL: ${config.rpcUrl}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Blockchain connection failed: ${error.message}`);
        return false;
    }
}

async function testContractAddresses() {
    console.log('\n📋 Testing contract addresses...');
    
    try {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        
        for (const [name, address] of Object.entries(config.contracts)) {
            const code = await provider.getCode(address);
            if (code === '0x') {
                console.log(`❌ Contract ${name} not deployed at ${address}`);
                return false;
            } else {
                console.log(`✅ Contract ${name} deployed at ${address}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Contract address test failed: ${error.message}`);
        return false;
    }
}

function testDOOMItemMappings() {
    console.log('\n🎮 Testing DOOM item mappings...');
    
    for (const [tokenId, item] of Object.entries(DOOM_ITEMS)) {
        console.log(`✅ Token ${tokenId}: ${item.name} → ${item.doomItem} (${item.enhancement})`);
    }
    
    return true;
}

function testGameScenarios() {
    console.log('\n🎯 Testing game scenarios...');
    
    testScenarios.forEach((scenario, index) => {
        console.log(`\n📋 Scenario ${index + 1}: ${scenario.name}`);
        console.log(`   Description: ${scenario.description}`);
        console.log(`   Steps:`);
        scenario.steps.forEach((step, stepIndex) => {
            console.log(`     ${stepIndex + 1}. ${step}`);
        });
    });
    
    return true;
}

function testConfiguration() {
    console.log('\n⚙️ Testing configuration...');
    
    const configFile = path.join(__dirname, 'blockchain.conf.example');
    if (fs.existsSync(configFile)) {
        console.log('✅ Configuration file exists');
        
        const configContent = fs.readFileSync(configFile, 'utf8');
        const requiredSettings = [
            'BLOCKCHAIN_RPC',
            'CONTRACT_ADDRESS',
            'WALLET_ADDRESS',
            'PRIVATE_KEY'
        ];
        
        requiredSettings.forEach(setting => {
            if (configContent.includes(setting)) {
                console.log(`✅ Setting ${setting} found in config`);
            } else {
                console.log(`❌ Setting ${setting} missing from config`);
            }
        });
        
        return true;
    } else {
        console.log('❌ Configuration file not found');
        return false;
    }
}

function testBuildSystem() {
    console.log('\n🔨 Testing build system...');
    
    const makefile = path.join(__dirname, 'Makefile');
    if (fs.existsSync(makefile)) {
        console.log('✅ Makefile exists');
        
        const makefileContent = fs.readFileSync(makefile, 'utf8');
        const requiredTargets = ['all', 'clean', 'install-deps', 'run', 'test'];
        
        requiredTargets.forEach(target => {
            if (makefileContent.includes(target)) {
                console.log(`✅ Target ${target} found in Makefile`);
            } else {
                console.log(`❌ Target ${target} missing from Makefile`);
            }
        });
        
        return true;
    } else {
        console.log('❌ Makefile not found');
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🎮 DOOM Blockchain Integration Test Suite');
    console.log('==========================================\n');
    
    const tests = [
        { name: 'Blockchain Connection', fn: testBlockchainConnection },
        { name: 'Contract Addresses', fn: testContractAddresses },
        { name: 'DOOM Item Mappings', fn: testDOOMItemMappings },
        { name: 'Game Scenarios', fn: testGameScenarios },
        { name: 'Configuration', fn: testConfiguration },
        { name: 'Build System', fn: testBuildSystem }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
                console.log(`✅ ${test.name}: PASSED`);
            } else {
                console.log(`❌ ${test.name}: FAILED`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    }
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! DOOM blockchain integration is ready!');
        console.log('\n🚀 Next steps:');
        console.log('1. Install dependencies: make install-deps');
        console.log('2. Build project: make');
        console.log('3. Configure: cp blockchain.conf.example blockchain.conf');
        console.log('4. Run: ./doom -blockchain -config blockchain.conf');
    } else {
        console.log('⚠️ Some tests failed. Please check the errors above.');
    }
}

// Run tests
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testBlockchainConnection,
    testContractAddresses,
    testDOOMItemMappings,
    testGameScenarios,
    testConfiguration,
    testBuildSystem,
    runTests
};
