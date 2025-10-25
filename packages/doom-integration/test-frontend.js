#!/usr/bin/env node

/**
 * Frontend Test Script for DOOM Blockchain Integration
 * Tests the frontend integration with Backpack Guilds protocol
 */

const http = require('http');
const https = require('https');

// Configuration
const config = {
    frontendUrl: 'http://localhost:3000',
    expectedPages: [
        '/',
        '/backpack',
        '/craft',
        '/party',
        '/rent'
    ],
    expectedFeatures: [
        'Connect Wallet',
        'My Backpack',
        'Craft Items',
        'Party Inventory',
        'Rent Items'
    ]
};

// Test functions
async function testFrontendConnection() {
    console.log('🌐 Testing frontend connection...');
    
    try {
        const response = await makeRequest(config.frontendUrl);
        if (response.statusCode === 200) {
            console.log('✅ Frontend is running on http://localhost:3000');
            return true;
        } else {
            console.log(`❌ Frontend returned status ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Frontend connection failed: ${error.message}`);
        return false;
    }
}

async function testPages() {
    console.log('\n📄 Testing pages...');
    
    let passed = 0;
    let total = config.expectedPages.length;
    
    for (const page of config.expectedPages) {
        try {
            const url = `${config.frontendUrl}${page}`;
            const response = await makeRequest(url);
            
            if (response.statusCode === 200) {
                console.log(`✅ Page ${page}: OK`);
                passed++;
            } else {
                console.log(`❌ Page ${page}: Status ${response.statusCode}`);
            }
        } catch (error) {
            console.log(`❌ Page ${page}: Error - ${error.message}`);
        }
    }
    
    console.log(`📊 Pages: ${passed}/${total} passed`);
    return passed === total;
}

async function testFeatures() {
    console.log('\n🎮 Testing features...');
    
    try {
        const response = await makeRequest(config.frontendUrl);
        const html = response.data;
        
        let passed = 0;
        let total = config.expectedFeatures.length;
        
        for (const feature of config.expectedFeatures) {
            if (html.includes(feature)) {
                console.log(`✅ Feature "${feature}": Found`);
                passed++;
            } else {
                console.log(`❌ Feature "${feature}": Not found`);
            }
        }
        
        console.log(`📊 Features: ${passed}/${total} found`);
        return passed === total;
    } catch (error) {
        console.log(`❌ Feature test failed: ${error.message}`);
        return false;
    }
}

async function testBlockchainIntegration() {
    console.log('\n🔗 Testing blockchain integration...');
    
    try {
        const response = await makeRequest(config.frontendUrl);
        const html = response.data;
        
        const blockchainFeatures = [
            'WagmiProvider',
            'useAccount',
            'useReadContract',
            'ethers',
            'blockchain',
            'contract'
        ];
        
        let passed = 0;
        let total = blockchainFeatures.length;
        
        for (const feature of blockchainFeatures) {
            if (html.includes(feature)) {
                console.log(`✅ Blockchain feature "${feature}": Found`);
                passed++;
            } else {
                console.log(`❌ Blockchain feature "${feature}": Not found`);
            }
        }
        
        console.log(`📊 Blockchain features: ${passed}/${total} found`);
        return passed === total;
    } catch (error) {
        console.log(`❌ Blockchain integration test failed: ${error.message}`);
        return false;
    }
}

async function testDOOMIntegration() {
    console.log('\n🎮 Testing DOOM integration...');
    
    try {
        const response = await makeRequest(config.frontendUrl);
        const html = response.data;
        
        const doomFeatures = [
            'Sword',
            'Shield',
            'Herb',
            'Potion',
            'Chainsaw',
            'Shotgun',
            'Health',
            'Power-up'
        ];
        
        let passed = 0;
        let total = doomFeatures.length;
        
        for (const feature of doomFeatures) {
            if (html.includes(feature)) {
                console.log(`✅ DOOM feature "${feature}": Found`);
                passed++;
            } else {
                console.log(`❌ DOOM feature "${feature}": Not found`);
            }
        }
        
        console.log(`📊 DOOM features: ${passed}/${total} found`);
        return passed === total;
    } catch (error) {
        console.log(`❌ DOOM integration test failed: ${error.message}`);
        return false;
    }
}

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Main test function
async function runTests() {
    console.log('🎮 Frontend Test Suite for DOOM Blockchain Integration');
    console.log('====================================================\n');
    
    const tests = [
        { name: 'Frontend Connection', fn: testFrontendConnection },
        { name: 'Pages', fn: testPages },
        { name: 'Features', fn: testFeatures },
        { name: 'Blockchain Integration', fn: testBlockchainIntegration },
        { name: 'DOOM Integration', fn: testDOOMIntegration }
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
        console.log('🎉 All frontend tests passed!');
        console.log('\n🚀 Frontend is ready for DOOM blockchain integration!');
        console.log('\n📋 Available features:');
        console.log('• Connect Wallet - Connect to blockchain');
        console.log('• My Backpack - View blockchain items');
        console.log('• Craft Items - Create new items');
        console.log('• Party Inventory - Share items with party');
        console.log('• Rent Items - Rent weapons from other players');
        console.log('\n🌐 Open http://localhost:3000 in your browser to test!');
    } else {
        console.log('⚠️ Some frontend tests failed. Please check the errors above.');
    }
}

// Run tests
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testFrontendConnection,
    testPages,
    testFeatures,
    testBlockchainIntegration,
    testDOOMIntegration,
    runTests
};
