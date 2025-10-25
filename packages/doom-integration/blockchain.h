#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "doomdef.h"
#include "p_local.h"
#include "s_sound.h"
#include "m_random.h"
#include "g_game.h"
#include "r_state.h"

// Blockchain configuration
#define MAX_BLOCKCHAIN_ITEMS 100
#define BLOCKCHAIN_RPC "https://sepolia.era.zksync.dev"
#define CONTRACT_ADDRESS "0x..."

// Token IDs mapping to DOOM items
#define TOKEN_SWORD 1      // Chainsaw enhancement
#define TOKEN_SHIELD 2     // Shotgun enhancement  
#define TOKEN_HERB 3       // Health enhancement
#define TOKEN_POTION 4     // Power-up enhancement
#define TOKEN_HEALTH_POTION 5  // Crafted health potion
#define TOKEN_ARMOR 6      // Crafted armor
#define TOKEN_SUPER_SHOTGUN 7  // Crafted super shotgun

// Blockchain item structure
typedef struct {
    int tokenId;
    int amount;
    int expires;
    char owner[42];
    char user[42];
} blockchain_item_t;

// Global blockchain items
extern blockchain_item_t blockchain_items[MAX_BLOCKCHAIN_ITEMS];
extern int num_blockchain_items;

// Function prototypes
boolean P_CheckBlockchainItem(player_t* player, int tokenId);
void P_ConsumeBlockchainItem(player_t* player, int tokenId);
int fetch_blockchain_items(const char* player_address);
int parse_blockchain_response(const char* response);
void create_crafted_item(int tokenId, int amount);
void transfer_blockchain_item(const char* from, const char* to, int tokenId, int amount, int duration);
const char* get_item_name(int tokenId);

// Enhanced weapon functions
void P_FireChainsawBlockchain(player_t* player);
void P_FireShotgunBlockchain(player_t* player);
boolean P_GiveHealthBlockchain(player_t* player, int amount);
boolean P_GivePowerupBlockchain(player_t* player, int powerup);

// Menu functions
void M_BlockchainMenu(void);
void M_ViewMyItems(void);
void M_RentWeapons(void);
void M_LendWeapons(void);
void M_CraftItems(void);
void M_PartySystem(void);
void M_ShareItems(void);
void M_JoinParty(void);
void M_CreateParty(void);
void M_ViewPartyMembers(void);

// Crafting functions
void M_CraftHealthPotion(void);
void M_CraftArmor(void);
void M_CraftSuperShotgun(void);

#endif
