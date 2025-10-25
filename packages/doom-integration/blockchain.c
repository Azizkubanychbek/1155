#include "blockchain.h"
#include <curl/curl.h>
#include <json-c/json.h>
#include <string.h>
#include <stdio.h>

// Global blockchain items
blockchain_item_t blockchain_items[MAX_BLOCKCHAIN_ITEMS];
int num_blockchain_items = 0;

// Function to check if player has blockchain item
boolean P_CheckBlockchainItem(player_t* player, int tokenId) {
    for (int i = 0; i < num_blockchain_items; i++) {
        if (blockchain_items[i].tokenId == tokenId && 
            blockchain_items[i].expires > gametic &&
            strcmp(blockchain_items[i].user, player->blockchain_address) == 0) {
            return true;
        }
    }
    return false;
}

// Function to consume blockchain item
void P_ConsumeBlockchainItem(player_t* player, int tokenId) {
    for (int i = 0; i < num_blockchain_items; i++) {
        if (blockchain_items[i].tokenId == tokenId && 
            strcmp(blockchain_items[i].user, player->blockchain_address) == 0) {
            blockchain_items[i].amount--;
            if (blockchain_items[i].amount <= 0) {
                // Remove item from array
                for (int j = i; j < num_blockchain_items - 1; j++) {
                    blockchain_items[j] = blockchain_items[j + 1];
                }
                num_blockchain_items--;
            }
            break;
        }
    }
}

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

// Function to parse blockchain response
int parse_blockchain_response(const char* response) {
    json_object *json, *result, *items;
    json_object *item, *tokenId, *amount, *expires;
    
    json = json_tokener_parse(response);
    if (!json) return 0;
    
    if (json_object_object_get_ex(json, "result", &result)) {
        if (json_object_object_get_ex(result, "items", &items)) {
            int num_items = json_object_array_length(items);
            for (int i = 0; i < num_items; i++) {
                item = json_object_array_get_idx(items, i);
                json_object_object_get_ex(item, "tokenId", &tokenId);
                json_object_object_get_ex(item, "amount", &amount);
                json_object_object_get_ex(item, "expires", &expires);
                
                blockchain_items[num_blockchain_items].tokenId = json_object_get_int(tokenId);
                blockchain_items[num_blockchain_items].amount = json_object_get_int(amount);
                blockchain_items[num_blockchain_items].expires = json_object_get_int(expires);
                num_blockchain_items++;
            }
        }
    }
    
    json_object_put(json);
    return num_blockchain_items;
}

// Function to get item name
const char* get_item_name(int tokenId) {
    switch (tokenId) {
        case TOKEN_SWORD: return "Sword";
        case TOKEN_SHIELD: return "Shield";
        case TOKEN_HERB: return "Herb";
        case TOKEN_POTION: return "Potion";
        case TOKEN_HEALTH_POTION: return "Health Potion";
        case TOKEN_ARMOR: return "Armor";
        case TOKEN_SUPER_SHOTGUN: return "Super Shotgun";
        default: return "Unknown Item";
    }
}

// Enhanced chainsaw with blockchain power
void P_FireChainsawBlockchain(player_t* player) {
    if (P_CheckBlockchainItem(player, TOKEN_SWORD)) {
        P_ConsumeBlockchainItem(player, TOKEN_SWORD);
        
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

// Enhanced shotgun with blockchain power
void P_FireShotgunBlockchain(player_t* player) {
    if (P_CheckBlockchainItem(player, TOKEN_SHIELD)) {
        P_ConsumeBlockchainItem(player, TOKEN_SHIELD);
        
        // Enhanced damage and range
        player->damagecount = 15; // Increased from 10
        player->attackspeed = 12; // Increased from 15
        
        // Visual effects
        P_SpawnMobj(player->mo->x, player->mo->y, player->mo->z, MT_BLOOD);
        
        // Sound effects
        S_StartSound(player->mo, sfx_shotgn);
    } else {
        // Standard shotgun
        P_FireShotgunStandard(player);
    }
}

// Enhanced health with blockchain items
boolean P_GiveHealthBlockchain(player_t* player, int amount) {
    if (P_CheckBlockchainItem(player, TOKEN_HERB)) {
        P_ConsumeBlockchainItem(player, TOKEN_HERB);
        
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

// Enhanced power-ups with blockchain items
boolean P_GivePowerupBlockchain(player_t* player, int powerup) {
    if (P_CheckBlockchainItem(player, TOKEN_POTION)) {
        P_ConsumeBlockchainItem(player, TOKEN_POTION);
        
        // Enhanced power-up effects
        if (powerup == pw_invulnerability) {
            player->powers[pw_invulnerability] = INVULNTICS * 2; // Double duration
            player->powers[pw_strength] = STRENGTHTICS; // Add strength
        }
        
        // Visual effects
        P_SpawnMobj(player->mo->x, player->mo->y, player->mo->z, MT_INV);
        
        return true;
    } else {
        // Standard power-up
        return P_GivePowerupStandard(player, powerup);
    }
}

// Blockchain menu
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

// View player's blockchain items
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

// Craft items menu
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

// Craft health potion
void M_CraftHealthPotion(void) {
    if (P_CheckBlockchainItem(player, TOKEN_HERB) && 
        P_CheckBlockchainItem(player, TOKEN_HERB)) {
        
        // Consume ingredients
        P_ConsumeBlockchainItem(player, TOKEN_HERB);
        P_ConsumeBlockchainItem(player, TOKEN_HERB);
        
        // Create new item
        create_crafted_item(TOKEN_HEALTH_POTION, 1);
        
        M_StartMessage("Crafting", "Health Potion crafted!", 1);
    } else {
        M_StartMessage("Crafting", "Not enough ingredients!", 1);
    }
}

// Craft armor
void M_CraftArmor(void) {
    if (P_CheckBlockchainItem(player, TOKEN_SHIELD) && 
        P_CheckBlockchainItem(player, TOKEN_POTION)) {
        
        // Consume ingredients
        P_ConsumeBlockchainItem(player, TOKEN_SHIELD);
        P_ConsumeBlockchainItem(player, TOKEN_POTION);
        
        // Create new item
        create_crafted_item(TOKEN_ARMOR, 1);
        
        M_StartMessage("Crafting", "Armor crafted!", 1);
    } else {
        M_StartMessage("Crafting", "Not enough ingredients!", 1);
    }
}

// Craft super shotgun
void M_CraftSuperShotgun(void) {
    if (P_CheckBlockchainItem(player, TOKEN_SWORD) && 
        P_CheckBlockchainItem(player, TOKEN_POTION)) {
        
        // Consume ingredients
        P_ConsumeBlockchainItem(player, TOKEN_SWORD);
        P_ConsumeBlockchainItem(player, TOKEN_POTION);
        
        // Create new item
        create_crafted_item(TOKEN_SUPER_SHOTGUN, 1);
        
        M_StartMessage("Crafting", "Super Shotgun crafted!", 1);
    } else {
        M_StartMessage("Crafting", "Not enough ingredients!", 1);
    }
}

// Party system
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

// Share items with party members
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

// Create crafted item
void create_crafted_item(int tokenId, int amount) {
    // This would call the blockchain contract to create a new item
    // For now, we'll just add it to the local array
    if (num_blockchain_items < MAX_BLOCKCHAIN_ITEMS) {
        blockchain_items[num_blockchain_items].tokenId = tokenId;
        blockchain_items[num_blockchain_items].amount = amount;
        blockchain_items[num_blockchain_items].expires = gametic + 3600; // 1 hour
        strcpy(blockchain_items[num_blockchain_items].user, player->blockchain_address);
        num_blockchain_items++;
    }
}

// Transfer blockchain item
void transfer_blockchain_item(const char* from, const char* to, int tokenId, int amount, int duration) {
    // This would call the blockchain contract to transfer usage rights
    // For now, we'll just update the local array
    for (int i = 0; i < num_blockchain_items; i++) {
        if (blockchain_items[i].tokenId == tokenId && 
            strcmp(blockchain_items[i].user, from) == 0) {
            strcpy(blockchain_items[i].user, to);
            blockchain_items[i].expires = gametic + duration;
            break;
        }
    }
}
