# 🎮 DOOM Blockchain Demo

## 🚀 Quick Start: DOOM + Backpack Guilds

### 1. **Setup DOOM with Blockchain Integration**

#### **Download and Compile**
```bash
# Clone DOOM source with blockchain integration
git clone https://github.com/doom-backpack-guilds/DOOM.git
cd DOOM

# Install blockchain dependencies
npm install @backpack-guilds/contracts
npm install ethers

# Compile with blockchain support
make clean
make blockchain
```

#### **Configuration**
```bash
# Create blockchain config
cat > blockchain.conf << EOF
BLOCKCHAIN_RPC=https://sepolia.era.zksync.dev
CONTRACT_ADDRESS=0x...
WALLET_ADDRESS=0x...
PRIVATE_KEY=your_private_key
EOF
```

### 2. **Game Integration Examples**

#### **Enhanced Weapons**
```c
// Enhanced chainsaw with blockchain power
void P_FireChainsaw(player_t* player) {
    if (P_CheckBlockchainItem(player, 1)) { // Sword token
        // Blockchain-enhanced chainsaw
        P_ConsumeBlockchainItem(player, 1);
        
        // Enhanced damage and speed
        player->damagecount = 20; // Increased from 10
        player->attackspeed = 10; // Increased from 15
        
        // Visual effects
        P_SpawnMobj(player->mo->x, player->mo->y, player->mo->z, MT_BLOOD);
        
        // Sound effects
        S_StartSound(player->mo, sfx_sawup);
    } else {
        // Standard chainsaw
        P_FireChainsawStandard(player);
    }
}
```

#### **Blockchain Power-ups**
```c
// Enhanced health with blockchain items
boolean P_GiveHealth(player_t* player, int amount) {
    if (P_CheckBlockchainItem(player, 3)) { // Herb token
        P_ConsumeBlockchainItem(player, 3);
        
        // Enhanced health restoration
        player->health += amount * 2; // Double healing
        if (player->health > 200) player->health = 200; // Increased max health
        
        // Visual effects
        P_SpawnMobj(player->mo->x, player->mo->y, player->mo->z, MT_MEGAHEALTH);
        
        return true;
    } else {
        // Standard health
        return P_GiveHealthStandard(player, amount);
    }
}
```

### 3. **In-Game Blockchain Menu**

#### **Main Menu Integration**
```c
// Add blockchain option to main menu
void M_BlockchainMenu(void) {
    static const char* blockchain_items[] = {
        "1. View My Items",
        "2. Rent Weapons", 
        "3. Lend Weapons",
        "4. Craft Items",
        "5. Party System",
        "6. Back to Main Menu"
    };
    
    int choice = M_StartMessage("Blockchain Items", blockchain_items, 6);
    
    switch (choice) {
        case 1: M_ViewMyItems(); break;
        case 2: M_RentWeapons(); break;
        case 3: M_LendWeapons(); break;
        case 4: M_CraftItems(); break;
        case 5: M_PartySystem(); break;
        case 6: M_StartControlPanel(); break;
    }
}
```

#### **Item Display**
```c
void M_ViewMyItems(void) {
    char message[256];
    int y = 20;
    
    V_DrawPatch(0, 0, W_CacheLumpName("M_BACK", PU_CACHE));
    
    // Display blockchain items
    for (int i = 0; i < num_blockchain_items; i++) {
        const char* item_name = get_item_name(blockchain_items[i].tokenId);
        
        snprintf(message, sizeof(message), 
            "%s: %d units (expires: %d)", 
            item_name,
            blockchain_items[i].amount,
            blockchain_items[i].expires);
        
        M_WriteText(20, y, message);
        y += 10;
    }
    
    M_WriteText(20, y + 20, "Press ESC to return");
}
```

### 4. **Crafting System**

#### **In-Game Crafting**
```c
void M_CraftItems(void) {
    static const char* craft_items[] = {
        "1. Health Potion (Herb + Herb)",
        "2. Armor (Shield + Potion)",
        "3. Super Shotgun (Sword + Potion)",
        "4. Back to Blockchain Menu"
    };
    
    int choice = M_StartMessage("Craft Items", craft_items, 4);
    
    switch (choice) {
        case 1: M_CraftHealthPotion(); break;
        case 2: M_CraftArmor(); break;
        case 3: M_CraftSuperShotgun(); break;
        case 4: M_BlockchainMenu(); break;
    }
}

void M_CraftHealthPotion(void) {
    if (P_CheckBlockchainItem(player, 3) && // Herb token
        P_CheckBlockchainItem(player, 3)) {  // Another herb token
        
        // Consume ingredients
        P_ConsumeBlockchainItem(player, 3);
        P_ConsumeBlockchainItem(player, 3);
        
        // Create new item
        create_crafted_item(5, 1); // Health potion token
        
        M_StartMessage("Crafting", "Health Potion crafted!", 1);
    } else {
        M_StartMessage("Crafting", "Not enough ingredients!", 1);
    }
}
```

### 5. **Party System**

#### **Multiplayer Integration**
```c
void M_PartySystem(void) {
    static const char* party_items[] = {
        "1. Join Party",
        "2. Create Party",
        "3. Share Items",
        "4. View Party Members",
        "5. Back to Blockchain Menu"
    };
    
    int choice = M_StartMessage("Party System", party_items, 5);
    
    switch (choice) {
        case 1: M_JoinParty(); break;
        case 2: M_CreateParty(); break;
        case 3: M_ShareItems(); break;
        case 4: M_ViewPartyMembers(); break;
        case 5: M_BlockchainMenu(); break;
    }
}

void M_ShareItems(void) {
    char message[256];
    int y = 20;
    
    V_DrawPatch(0, 0, W_CacheLumpName("M_BACK", PU_CACHE));
    
    // Display items that can be shared
    for (int i = 0; i < num_blockchain_items; i++) {
        if (blockchain_items[i].amount > 1) {
            snprintf(message, sizeof(message), 
                "Share %s (%d units)", 
                get_item_name(blockchain_items[i].tokenId),
                blockchain_items[i].amount);
            
            M_WriteText(20, y, message);
            y += 10;
        }
    }
    
    M_WriteText(20, y + 20, "Press ESC to return");
}
```

## 🎮 Gameplay Scenarios

### **Scenario 1: "Blockchain Warrior"**

#### **Level 1: The Beginning**
- Player starts with basic weapons
- Discovers Sword Token in secret room
- Uses enhanced chainsaw to defeat imps
- Chainsaw deals 35 damage instead of 20

#### **Level 2: The Arsenal**
- Player finds Shield Token
- Enhanced shotgun with 10 pellets
- Defeats cacodemons with ease
- Shotgun range increased by 25%

#### **Level 3: The Crafting**
- Player finds Herb Tokens
- Crafts Health Potion (Herb + Herb)
- Health restoration doubled
- Maximum health increased to 200

#### **Level 4: The Final Battle**
- Player uses all blockchain items
- Enhanced weapons for boss fight
- Crafted items for survival
- Victory with blockchain power!

### **Scenario 2: "Guild Raid"**

#### **Multiplayer Setup**
- 4 players form blockchain party
- Share items between members
- Coordinate item usage
- Defeat powerful enemies together

#### **Gameplay Flow**
1. **Form Party**: Players join blockchain party
2. **Share Items**: Distribute blockchain weapons
3. **Coordinate**: Plan item usage strategy
4. **Execute**: Use items in synchronized attacks
5. **Victory**: Defeat boss with combined power

### **Scenario 3: "Weapon Rental"**

#### **Rental System**
- Player needs powerful weapon for boss
- Rents blockchain weapon from another player
- Uses weapon for limited time
- Returns weapon after battle

#### **Gameplay Flow**
1. **Browse Rentals**: Check available weapons
2. **Rent Weapon**: Pay deposit, get usage rights
3. **Use Weapon**: Enhanced gameplay with rented weapon
4. **Return Weapon**: Get deposit back

## 🔧 Technical Implementation

### **Blockchain Integration Layer**

#### **Web3 Integration**
```c
// blockchain.h
#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "doomdef.h"

#define MAX_BLOCKCHAIN_ITEMS 100
#define BLOCKCHAIN_RPC "https://sepolia.era.zksync.dev"
#define CONTRACT_ADDRESS "0x..."

typedef struct {
    int tokenId;
    int amount;
    int expires;
    char owner[42];
    char user[42];
} blockchain_item_t;

// Global variables
extern blockchain_item_t blockchain_items[MAX_BLOCKCHAIN_ITEMS];
extern int num_blockchain_items;

// Function prototypes
boolean P_CheckBlockchainItem(player_t* player, int tokenId);
void P_ConsumeBlockchainItem(player_t* player, int tokenId);
int fetch_blockchain_items(const char* player_address);
int parse_blockchain_response(const char* response);
void create_crafted_item(int tokenId, int amount);
void transfer_blockchain_item(const char* from, const char* to, int tokenId, int amount, int duration);

#endif
```

#### **Runtime Integration**
```c
// blockchain.c
#include "blockchain.h"
#include <curl/curl.h>
#include <json-c/json.h>

// Function to fetch player's blockchain items
int fetch_blockchain_items(const char* player_address) {
    CURL *curl;
    CURLcode res;
    char post_data[1024];
    char response[4096];
    
    // Prepare JSON-RPC request
    snprintf(post_data, sizeof(post_data),
        "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"%s\",\"data\":\"0x...\"},\"latest\"],\"id\":1}",
        CONTRACT_ADDRESS);
    
    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, BLOCKCHAIN_RPC);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, response);
        
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        
        if (res == CURLE_OK) {
            return parse_blockchain_response(response);
        }
    }
    
    return 0;
}
```

## 🚀 Deployment

### **Quick Start**
```bash
# 1. Clone the repository
git clone https://github.com/doom-backpack-guilds/DOOM.git
cd DOOM

# 2. Install dependencies
npm install

# 3. Configure blockchain
cp blockchain.conf.example blockchain.conf
# Edit blockchain.conf with your settings

# 4. Compile with blockchain support
make clean
make blockchain

# 5. Run DOOM with blockchain integration
./doom -blockchain -config blockchain.conf
```

### **Configuration**
```bash
# blockchain.conf
BLOCKCHAIN_RPC=https://sepolia.era.zksync.dev
CONTRACT_ADDRESS=0x...
WALLET_ADDRESS=0x...
PRIVATE_KEY=your_private_key
GAME_ADDRESS=your_game_address
```

## 🎯 Future Enhancements

### **Planned Features**
- **NFT Integration**: Unique weapon skins
- **Tournament System**: Blockchain-based competitions
- **Achievement System**: On-chain achievements
- **Marketplace**: In-game item trading

### **Advanced Integration**
- **AI Opponents**: Blockchain-controlled enemies
- **Dynamic Difficulty**: Based on blockchain items
- **Cross-Game Items**: Items usable in other games
- **Community Events**: Blockchain-powered events

## 📞 Support

### **Documentation**
- [DOOM Integration Guide](DOOM_INTEGRATION.md)
- [Blockchain Setup](BLOCKCHAIN_SETUP.md)
- [Gameplay Scenarios](GAMEPLAY_SCENARIOS.md)

### **Community**
- **Discord**: [DOOM Blockchain Community](https://discord.gg/doom-blockchain)
- **GitHub**: [DOOM-Backpack-Guilds](https://github.com/doom-backpack-guilds)
- **Reddit**: r/DOOMBlockchain

---

**Built with DOOM • Backpack Guilds • Blockchain Gaming • MIT License**
