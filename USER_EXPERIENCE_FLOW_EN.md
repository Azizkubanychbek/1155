# 🎮 User Experience: Backpack Guilds

## 📊 User Journey Diagram

```mermaid
graph TD
    A[New User] --> B[Wallet Connection]
    B --> C[Reputation: 500 points]
    C --> D{Choose Action}
    
    D --> E[Lend Items]
    D --> F[Rent Items]
    D --> G[Craft Items]
    D --> H[Group Play]
    
    E --> E1[Select Item]
    E1 --> E2[Enter Recipient Address]
    E2 --> E3[Set Duration]
    E3 --> E4[Confirm]
    E4 --> E5[1 Hour Cooldown]
    E5 --> E6[+10-50 reputation]
    
    F --> F1[Find Item]
    F1 --> F2[Check Owner Reputation]
    F2 --> F3{Reputation >= 300?}
    F3 -->|Yes| F4[Buy Insurance?]
    F3 -->|No| F1
    F4 -->|Yes| F5[Pay Insurance 5%]
    F4 -->|No| F6[Pay Deposit]
    F5 --> F6
    F6 --> F7[Receive Rights]
    F7 --> F8[Use in Game]
    F8 --> F9[Return Item]
    F9 --> F10[Get Deposit Back]
    F10 --> F11[+10-50 reputation]
    
    G --> G1[Select Recipe]
    G1 --> G2[Check Materials]
    G2 --> G3[Craft Item]
    G3 --> G4[Get New Item]
    
    H --> H1[Create Group]
    H1 --> H2[Invite Friends]
    H2 --> H3[Shared Inventory]
    H3 --> H4[Joint Usage]
    
    E6 --> I[Monitor Reputation]
    F11 --> I
    I --> J{Reputation >= 700?}
    J -->|Yes| K[Premium Features]
    J -->|No| L[Basic Features]
    
    K --> M[Access to Expensive Items]
    K --> N[Better Rental Terms]
    K --> O[Participate in Disputes]
    
    L --> P[Limited Access]
    P --> Q[Build Reputation]
    Q --> I
    
    R[Rental Problem] --> S[Create Dispute]
    S --> T[Describe Problem]
    T --> U[Wait for Resolution]
    U --> V{Decision in Favor?}
    V -->|Yes| W[Get Compensation]
    V -->|No| X[Lose Deposit]
    
    Y[Rule Violation] --> Z[Reputation Penalty]
    Z --> AA{Reputation < 300?}
    AA -->|Yes| BB[7-Day Blacklist]
    AA -->|No| CC[Restrictions]
    
    BB --> DD[Wait for Recovery]
    DD --> EE[Return to System]
    EE --> I
```

## 🎯 Key User Scenarios

### 1. 🆕 New User
```
1. Wallet connection
2. Get starting reputation (500 points)
3. Explore interface
4. First rental (cheap item)
5. Build reputation
```

### 2. 🏆 Experienced User
```
1. Monitor reputation (700+ points)
2. Lend expensive items
3. Buy insurance
4. Participate in dispute resolution
5. Get premium features
```

### 3. 🛡️ Protected Rental
```
1. Find item with high owner reputation
2. Check rental history
3. Buy insurance (5% of cost)
4. Pay deposit
5. Safe usage
6. Return and get deposit back
```

### 4. ⚖️ Dispute Resolution
```
1. Detect problem
2. Create dispute with description
3. Attach evidence
4. Wait for community decision
5. Get compensation/penalty
```

## 📈 User Progression

### Level 1: Beginner (0-100 points)
- **Access**: Basic items
- **Restrictions**: Only cheap rentals
- **Goal**: Build reputation

### Level 2: Participant (100-300 points)
- **Access**: Medium items
- **Restrictions**: Limited features
- **Goal**: Achieve stability

### Level 3: Reliable (300-700 points)
- **Access**: Most items
- **Restrictions**: Minimal
- **Goal**: Achieve premium status

### Level 4: Premium (700-900 points)
- **Access**: All items
- **Bonuses**: Better terms
- **Goal**: Maintain status

### Level 5: Expert (900+ points)
- **Access**: Exclusive features
- **Bonuses**: Maximum privileges
- **Goal**: Community leadership

## 🎮 Gaming Mechanics

### Achievement System:
- **First rental**: +50 reputation
- **10 successful rentals**: +100 reputation
- **Help in dispute**: +25 reputation
- **Long-term usage**: +1 reputation per day

### Penalty System:
- **Early revoke**: -50 reputation
- **Violation**: -100 reputation
- **Dispute spam**: -25 reputation
- **3+ violations**: Blacklist

### Economic Incentives:
- **High reputation**: Insurance discounts
- **Long history**: Better rental terms
- **Community help**: Bonuses and privileges

## 🔄 Interaction Cycle

```mermaid
graph LR
    A[Research] --> B[Choose]
    B --> C[Action]
    C --> D[Result]
    D --> E[Feedback]
    E --> F[Learning]
    F --> A
    
    A1[Find Items] --> A
    B1[Check Reputation] --> B
    C1[Rent/Lend] --> C
    D1[Success/Failure] --> D
    E1[Reputation Change] --> E
    F1[Improve Strategy] --> F
```

## 🎯 Key Design Principles

### 1. **Transparency**
- All actions recorded on blockchain
- Reputation publicly visible
- Rental history available to all

### 2. **Fairness**
- Automatic penalties for violations
- Community decides disputes
- Economic incentives for honesty

### 3. **Security**
- Multi-level protection
- Insurance against fraud
- Cooldowns prevent abuse

### 4. **Community**
- Users help each other
- Joint dispute resolution
- Collective protection against fraudsters

## 🚀 Future Improvements

### Planned Features:
- **Rating system**: Stars for service quality
- **Group discounts**: Benefits for regular customers
- **Exclusive items**: Access only for high rating
- **Social features**: Friends, groups, chats

### Research Areas:
- **AI moderation**: Automatic fraud detection
- **Predictive analytics**: Risk forecasting
- **Personalization**: Individual recommendations
- **Gamification**: Achievements, levels, rewards
