# 🎮 DOOM Blockchain Integration

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
# Install required libraries
sudo apt-get update
sudo apt-get install -y libcurl4-openssl-dev libjson-c-dev build-essential

# Or on macOS
brew install curl json-c
```

### 2. **Build the Project**
```bash
# Clone the repository
git clone https://github.com/doom-backpack-guilds/DOOM.git
cd DOOM

# Build with blockchain integration
make clean
make blockchain
```

### 3. **Configure Blockchain**
```bash
# Copy configuration template
cp blockchain.conf.example blockchain.conf

# Edit configuration with your settings
nano blockchain.conf
```

### 4. **Run DOOM with Blockchain**
```bash
# Start DOOM with blockchain integration
./doom -blockchain -config blockchain.conf
```

## 🎯 Features

### **Blockchain-Enhanced Weapons**
- **Sword Token**: Enhanced chainsaw with 35 damage (vs 20 standard)
- **Shield Token**: Enhanced shotgun with 10 pellets (vs 7 standard)
- **Herb Token**: Double health restoration (50 vs 25)
- **Potion Token**: Extended power-up duration (60s vs 30s)

### **Crafting System**
- **Health Potion**: Herb + Herb → Health Potion
- **Armor**: Shield + Potion → Armor
- **Super Shotgun**: Sword + Potion → Super Shotgun

### **Party System**
- **Item Sharing**: Share blockchain items with party members
- **Coordinated Attacks**: Use items in synchronized attacks
- **Party Inventory**: Shared item storage

### **Rental System**
- **Weapon Rental**: Rent powerful weapons from other players
- **Deposit System**: Secure rental with deposits
- **Time Limits**: Limited usage periods

## 🔧 Configuration

### **Blockchain Settings**
```bash
# Network configuration
BLOCKCHAIN_RPC=https://sepolia.era.zksync.dev
CONTRACT_ADDRESS=0x...

# Wallet settings
WALLET_ADDRESS=0x...
PRIVATE_KEY=your_private_key_here
```

### **Gameplay Settings**
```bash
# Enhancement multipliers
ENHANCED_DAMAGE_MULTIPLIER=1.5
ENHANCED_SPEED_MULTIPLIER=1.2
ENHANCED_HEALTH_MULTIPLIER=2.0
ENHANCED_POWERUP_DURATION=2.0
```

## 🎮 Gameplay Scenarios

### **Scenario 1: "Blockchain Warrior"**
1. **Level 1**: Find Sword Token → Enhanced chainsaw
2. **Level 2**: Find Shield Token → Enhanced shotgun
3. **Level 3**: Craft Health Potion → Double healing
4. **Level 4**: Use all items for boss fight

### **Scenario 2: "Guild Raid"**
1. **Form Party**: Join blockchain party
2. **Share Items**: Distribute weapons
3. **Coordinate**: Plan synchronized attacks
4. **Execute**: Defeat boss with combined power

### **Scenario 3: "Weapon Rental"**
1. **Browse Rentals**: Check available weapons
2. **Rent Weapon**: Pay deposit, get usage rights
3. **Use Weapon**: Enhanced gameplay
4. **Return Weapon**: Get deposit back

## 🛠️ Development

### **Building from Source**
```bash
# Install dependencies
make install-deps

# Build project
make

# Build with debug symbols
make debug

# Build optimized release
make release
```

### **Testing**
```bash
# Run blockchain integration tests
make test

# Run with debug output
./doom -blockchain -debug
```

### **Packaging**
```bash
# Create distribution package
make package

# This creates doom-blockchain.tar.gz
```

## 📚 API Reference

### **Blockchain Functions**
```c
// Check if player has blockchain item
boolean P_CheckBlockchainItem(player_t* player, int tokenId);

// Consume blockchain item
void P_ConsumeBlockchainItem(player_t* player, int tokenId);

// Fetch player's blockchain items
int fetch_blockchain_items(const char* player_address);

// Create crafted item
void create_crafted_item(int tokenId, int amount);
```

### **Enhanced Weapon Functions**
```c
// Enhanced chainsaw with blockchain power
void P_FireChainsawBlockchain(player_t* player);

// Enhanced shotgun with blockchain power
void P_FireShotgunBlockchain(player_t* player);

// Enhanced health with blockchain items
boolean P_GiveHealthBlockchain(player_t* player, int amount);

// Enhanced power-ups with blockchain items
boolean P_GivePowerupBlockchain(player_t* player, int powerup);
```

### **Menu Functions**
```c
// Main blockchain menu
void M_BlockchainMenu(void);

// View player's items
void M_ViewMyItems(void);

// Craft items
void M_CraftItems(void);

// Party system
void M_PartySystem(void);
```

## 🎯 Token Mappings

| Token ID | Item Name | DOOM Item | Enhancement |
|----------|-----------|-----------|-------------|
| 1 | Sword | Chainsaw | +75% damage, +33% speed |
| 2 | Shield | Shotgun | +43% pellets, +25% range |
| 3 | Herb | Health | +100% healing, +25% max health |
| 4 | Potion | Power-up | +100% duration, +50% speed |
| 5 | Health Potion | Crafted | +200% healing |
| 6 | Armor | Crafted | +100% protection |
| 7 | Super Shotgun | Crafted | +150% damage |

## 🔧 Troubleshooting

### **Common Issues**

#### **Build Errors**
```bash
# Missing dependencies
sudo apt-get install libcurl4-openssl-dev libjson-c-dev

# Compilation errors
make clean
make
```

#### **Runtime Errors**
```bash
# Configuration errors
cp blockchain.conf.example blockchain.conf
# Edit blockchain.conf with correct settings

# Network errors
# Check BLOCKCHAIN_RPC and CONTRACT_ADDRESS
```

#### **Blockchain Errors**
```bash
# Wallet connection issues
# Check WALLET_ADDRESS and PRIVATE_KEY

# Contract interaction issues
# Verify CONTRACT_ADDRESS is correct
```

## 📞 Support

### **Documentation**
- [DOOM Integration Guide](../DOOM_INTEGRATION.md)
- [Blockchain Demo](../DOOM_BLOCKCHAIN_DEMO.md)
- [API Reference](API_REFERENCE.md)

### **Community**
- **Discord**: [DOOM Blockchain Community](https://discord.gg/doom-blockchain)
- **GitHub**: [DOOM-Backpack-Guilds](https://github.com/doom-backpack-guilds)
- **Reddit**: r/DOOMBlockchain

### **Issues**
- **Bug Reports**: [GitHub Issues](https://github.com/doom-backpack-guilds/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/doom-backpack-guilds/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with DOOM • Backpack Guilds • Blockchain Gaming • MIT License**
