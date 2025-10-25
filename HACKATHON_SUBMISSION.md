# 🏆 Backpack Guilds - Hackathon Submission

## 🎯 Project Overview

**Backpack Guilds** is a revolutionary gaming protocol that enables temporary item usage rights, party inventory sharing, and on-chain crafting with advanced security mechanisms.

### 🔗 GitHub Repository
**https://github.com/anteyko-labs/backpack-guilds**

### 🌐 Live Demo
**http://localhost:3000** (Local setup required)

## 🎮 Gaming Use Cases

### **Temporary Item Usage Rights (EIP-5006)**
- Players can lend items to others while maintaining ownership
- Time-limited usage rights with automatic expiration
- Perfect for guilds, parties, and collaborative gameplay

### **Party Inventory System**
- Shared inventory for guild members
- Collaborative item management
- Real-time synchronization across players

### **On-Chain Crafting**
- Create new items by combining existing ones
- Recipe system with blockchain verification
- Economic incentives for crafters

### **Secure Rental System**
- Deposit-based rental with escrow
- Reputation system to prevent fraud
- Insurance options for high-value items

## 🧠 Smart Contract Integration

### **Deployed on Xsolla ZK Sepolia Testnet**

#### **Core Contracts:**
- **UsageRights1155**: ERC-1155 tokens with temporary usage rights
- **PartyBackpack**: Shared inventory system
- **RecipeRegistry**: On-chain crafting recipes
- **RentalEscrow**: Secure rental system with deposits

#### **Security Contracts:**
- **ReputationSystem**: User behavior tracking
- **RentalInsurance**: Optional insurance for rentals

### **Contract Addresses:**
```
UsageRights1155: 0xfbA1b6DCcB692DC9b7221E66D63E9bF2c643199c
PartyBackpack: 0x03448630519fC80583b67Ae5d1F80E4f9Eb72CB9
RecipeRegistry: 0x9628fa7Aaac8d27D92c4AF1F1eBF83024d0B7A04
RentalEscrow: 0xBd047AE83778825Cdf86B4b08caa69Ee72eD3159
```

## 🧰 Technology Stack

### **Built on zkSync Ecosystem**
- **Hardhat**: Smart contract development
- **zkSync Sepolia**: Layer 2 deployment
- **Next.js 14**: Modern React framework
- **Wagmi**: Web3 React hooks
- **TailwindCSS**: Utility-first styling

### **Monorepo Structure**
```
backpack-guilds/
├── packages/
│   ├── contracts/     # Smart contracts
│   └── frontend/      # React application
├── docs/              # Documentation
└── README.md          # Project overview
```

## 🎯 Problem Solved

### **Current Gaming Issues:**
1. **Item Hoarding**: Players accumulate items they don't use
2. **Trust Issues**: No secure way to lend valuable items
3. **Guild Management**: Difficult to share resources efficiently
4. **Fraud Prevention**: No protection against "rug pulls"

### **Our Solution:**
1. **Temporary Rights**: Lend items while keeping ownership
2. **Reputation System**: Track user behavior and build trust
3. **Party System**: Seamless guild resource sharing
4. **Security Mechanisms**: Multiple layers of fraud protection

## 🚀 Key Innovations

### **1. EIP-5006 Implementation**
- First gaming protocol to implement temporary usage rights
- Enables new economic models in gaming
- Maintains ownership while granting usage

### **2. Advanced Security**
- **Reputation System**: Track user behavior
- **Cooldown Protection**: Prevent rapid abuse
- **Penalty System**: Economic consequences for violations
- **Dispute Resolution**: Community-driven conflict resolution
- **Insurance System**: Optional protection for high-value items

### **3. Guild Economics**
- **Party Inventory**: Shared resources
- **Crafting System**: Create new items
- **Rental Market**: Monetize unused items
- **Reputation Rewards**: Incentivize good behavior

## 🎮 Gaming Scenarios

### **Scenario 1: Guild Raid**
1. Guild leader lends powerful weapons to members
2. Members use weapons for raid
3. Weapons automatically return after raid
4. Reputation system tracks successful raids

### **Scenario 2: Item Trading**
1. Player wants to try expensive item
2. Rents item for limited time
3. Pays deposit as security
4. Returns item to get deposit back

### **Scenario 3: Crafting Collaboration**
1. Players combine resources in party inventory
2. Craft powerful items together
3. Share crafted items based on contribution
4. Build reputation through successful crafts

## 🔧 Local Setup

### **Prerequisites**
- Node.js 18+
- pnpm
- MetaMask wallet
- Xsolla ZK Sepolia testnet ETH

### **Installation**
```bash
# Clone repository
git clone https://github.com/anteyko-labs/backpack-guilds.git
cd backpack-guilds

# Install dependencies
pnpm install

# Setup environment
cp packages/contracts/env.example packages/contracts/.env
cp packages/frontend/env.example packages/frontend/.env.local

# Deploy contracts
cd packages/contracts
pnpm run deploy:zkSyncSepolia

# Start frontend
cd ../frontend
pnpm run dev
```

### **Access Application**
- Open http://localhost:3000
- Connect MetaMask wallet
- Switch to Xsolla ZK Sepolia testnet
- Start using the protocol!

## 📊 Technical Specifications

### **Smart Contracts**
- **Solidity 0.8.24**: Latest stable version
- **OpenZeppelin**: Audited security standards
- **Gas Optimized**: Efficient zkSync operations
- **Upgradeable**: Future-proof architecture

### **Frontend**
- **Next.js 14**: App Router, Server Components
- **TypeScript**: Full type safety
- **Wagmi v2**: Modern Web3 integration
- **Responsive Design**: Mobile-first approach

### **Security**
- **Multi-layer Protection**: Reputation, cooldowns, penalties
- **Economic Incentives**: Align user behavior with protocol
- **Community Governance**: Dispute resolution system
- **Insurance Options**: Optional protection for users

## 🏆 Competitive Advantages

### **1. Technical Innovation**
- First EIP-5006 gaming implementation
- Advanced security mechanisms
- Modular architecture for easy integration

### **2. Gaming Focus**
- Built specifically for gaming use cases
- Guild-friendly features
- Economic incentives for good behavior

### **3. Security First**
- Multiple fraud prevention layers
- Reputation-based trust system
- Community-driven dispute resolution

### **4. Developer Friendly**
- Well-documented APIs
- Modular smart contracts
- Easy integration with existing games

## 🎯 Future Roadmap

### **Phase 1: Core Protocol** ✅
- Basic rental system
- Party inventory
- On-chain crafting

### **Phase 2: Security** ✅
- Reputation system
- Fraud protection
- Insurance system

### **Phase 3: Integration** 🔄
- Game SDK development
- API documentation
- Developer tools

### **Phase 4: Ecosystem** 📋
- Cross-game compatibility
- Advanced DeFi features
- DAO governance

## 📞 Contact & Support

### **Team**
- **GitHub**: https://github.com/anteyko-labs/backpack-guilds
- **Documentation**: Comprehensive guides included
- **Support**: Active development and maintenance

### **Resources**
- **User Guide**: `USER_GUIDE_EN.md`
- **Quick Start**: `QUICK_START_GUIDE_EN.md`
- **Security**: `SECURITY_MECHANISMS.md`
- **Features**: `COMPLETE_FEATURES_GUIDE.md`

## 🏆 Why We Deserve to Win

### **1. Innovation**
- First gaming protocol with EIP-5006
- Novel security mechanisms
- New economic models for gaming

### **2. Functionality**
- Fully working system
- Real smart contracts deployed
- Complete user interface

### **3. Gaming Impact**
- Solves real gaming problems
- Enables new gameplay mechanics
- Creates sustainable gaming economies

### **4. Technical Excellence**
- Modern development stack
- Security-first approach
- Comprehensive documentation

---

**Backpack Guilds represents the future of gaming economies - secure, innovative, and built for players.**

**Ready to revolutionize gaming with blockchain technology!** 🚀
