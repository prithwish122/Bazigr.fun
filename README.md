# 🎯 Bazigr DeFi Platform

**Live Demo:** [https://bazigr-fun.vercel.app/](https://bazigr-fun.vercel.app/)  
**Network:** Celo Sepolia Testnet  

---

## 📋 Smart Contract Addresses (Celo Sepolia Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **BAZ Token** | `0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9` | [View]https://sepolia.celoscan.io/address/0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9) |
| **WCELO (Wrapped CELO)** | `0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF` | [View]https://sepolia.celoscan.io/address/0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF) |
| **UniswapV2 Factory** | `0xf29E685888FbF4f5AADbA8a3dF2499EfF6BFfE1C` | [View]https://sepolia.celoscan.io/address/0xf29E685888FbF4f5AADbA8a3dF2499EfF6BFfE1C) |
| **UniswapV2 Router** | `0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1` | [View]https://sepolia.celoscan.io/address/0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1) |
| **MasterChef (Farming)** | `0xd6f36ebA3775C25Da19D730A687Dc807b7912449` | [View]https://sepolia.celoscan.io/address/0xd6f36ebA3775C25Da19D730A687Dc807b7912449) |
| **BAZ/WCELO Liquidity Pair** | `0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14` | [View]https://sepolia.celoscan.io/address/0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14) |
| **SWAP** | `0xfE053B49CE20845E6c492A575daCDD5ab7d3038D` | [View]https://sepolia.celoscan.io/address/0xfE053B49CE20845E6c492A575daCDD5ab7d3038D) |
| **Bridge** | `0x118b30B86500239442744A73F1384D97F8C9B63C` | [View]https://sepolia.celoscan.io/address/0x118b30B86500239442744A73F1384D97F8C9B63C) |




---

## 🎨 Project Overview

**Bazigr** is a **gamified DeFi platform** built on the **Celo Sepolia Testnet**, designed to make decentralized finance fun, interactive, and rewarding for users of all skill levels.

The platform provides a complete decentralized exchange (DEX) experience with **automated market making (AMM)**, **liquidity pools**, and **yield farming** capabilities. Users can **swap tokens**, **provide liquidity**, and **stake LP tokens** to earn rewards while building their on-chain reputation through activity tracking and rewards.

---

## 🏗️ Project Architecture
 
```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend Layer (Next.js)"]
        UI["UI Components<br/>- Swap Interface<br/>- Liquidity Pool Manager<br/>- Farm Dashboard"]
        Hooks["Custom Hooks<br/>- useSwap()<br/>- useLiquidity()<br/>- useFarm()"]
        Context["React Context<br/>- Wallet State<br/>- User Balances<br/>- Transaction Status"]
    end

    subgraph Web3["⛓️ Web3 Integration Layer"]
        Wagmi["Wagmi + AppKit<br/>(Wallet Connection)"]
        Ethers["Ethers.js<br/>(Contract Interaction)"]
    end

    subgraph Contracts["📝 Smart Contracts (Celo Sepolia)"]
        Router["🔄 UniswapV2Router<br/>0xb15B6512..."]
        Factory["🏭 UniswapV2Factory<br/>0xf29E6858..."]
        MasterChef["🌾 MasterChef<br/>0xd6f36ebA..."]
        Tokens["💰 Tokens<br/>- BAZ: 0xB5692EC2...<br/>- WCELO: 0x8C3EBc35..."]
        Pair["🔗 BAZ/WCELO Pair<br/>0x8e31cdeb..."]
    end

    subgraph Blockchain["⛓️ Celo Sepolia Blockchain"]
        Chain["Blockchain Network<br/>- Chain ID: 11142220<br/>- RPC: forno.celo-sepolia"]
    end

    UI --> Hooks
    Hooks --> Context
    Context --> Web3
    Wagmi --> Ethers
    Ethers --> Contracts
    Router --> Factory
    Router --> Tokens
    Router --> Pair
    MasterChef --> Tokens
    MasterChef --> Pair
    Contracts --> Chain
```

---

## 🚀 Core Features

### 1️⃣ **🔄 Swap - Token Exchange**

**Purpose:** Trade between **BAZ** and **WCELO** with minimal fees and slippage protection.

#### How It Works:
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Wallet
    participant Router as UniswapV2Router
    participant Pair as BAZ/WCELO Pair

    User->>Frontend: Enter swap amount (e.g., 100 BAZ → WCELO)
    Frontend->>Router: Get output amount quote
    Router->>Pair: Read pool reserves (BAZ, WCELO)
    Pair-->>Router: Return reserves
    Router-->>Frontend: Calculate output (with 0.3% fee)
    Frontend-->>User: Show exchange rate & fees
    
    User->>Wallet: Approve BAZ token spend
    Wallet-->>Frontend: Approval confirmed
    
    User->>Frontend: Click "Swap"
    Frontend->>Router: Execute swap transaction
    Router->>Pair: Swap tokens (x*y=k formula)
    Pair->>Pair: Update reserves + fees
    Pair-->>User: Receive WCELO tokens

    Note over Frontend: Fee (0.3%) sent to Liquidity Providers
```

#### Key Features:
- ✅ **0.3% Trading Fee** - Distributed to liquidity providers
- ✅ **5% Slippage Protection** - Prevents sandwich attacks
- ✅ **Real-time Pricing** - Based on pool reserves (constant product formula: x × y = k)
- ✅ **Minimal Gas Costs** - Optimized for Celo network

#### User Flow:
1. Navigate to **Swap** tab
2. Select token: **BAZ** or **WCELO**
3. Enter amount to swap
4. Review exchange rate (automatically calculated)
5. Click "Approve" (if first time) → Sign transaction
6. Click "Swap" → Sign transaction
7. Receive tokens instantly ⚡

---

### 2️⃣ **💧 Liquidity - Provide Capital to Pool**

**Purpose:** Earn trading fees by providing liquidity to the **BAZ/WCELO** pool.

#### How It Works:
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Wallet
    participant Router as UniswapV2Router
    participant Pair as BAZ/WCELO Pair

    User->>Frontend: Want to add liquidity
    Frontend->>Frontend: Calculate ratio (equal value)
    Frontend-->>User: Show: "100 BAZ + 0.5 WCELO = LP Tokens"
    
    User->>Wallet: Approve BAZ token
    Wallet-->>Frontend: BAZ approval done
    User->>Wallet: Approve WCELO token
    Wallet-->>Frontend: WCELO approval done
    
    User->>Frontend: Click "Add Liquidity"
    Frontend->>Router: Add liquidity with amounts
    Router->>Pair: Deposit BAZ & WCELO
    Pair->>Pair: Mint LP tokens
    Pair-->>User: Receive LP tokens
    
    Note over User: LP shares = (user_amount / total_amount) * total_LP_tokens
    Note over Pair: User now earns 0.3% of all swaps proportionally
```

#### What Happens:
- 📊 **Deposit Equal Value** - 100 BAZ + 0.5 WCELO (approximately equal USD value)
- 🎟️ **Receive LP Tokens** - Represents your share of the pool
- 💰 **Earn Trading Fees** - 0.3% of every swap, proportional to your share
- 🔐 **Keep Your Funds** - You always own and can withdraw your liquidity

#### Economics Example:
```
Pool Total: 1000 BAZ + 5 WCELO = 1000 LP Tokens
Your Add: 100 BAZ + 0.5 WCELO → You get ~100 LP tokens (10% share)

Daily Swaps: $10,000 volume × 0.3% fee = $30 in fees
Your Share: 10% × $30 = $3 earned per day
```

#### User Flow:
1. Navigate to **Liquidity** tab
2. **Step 1: Wrap CELO (if needed)**
   - Enter CELO amount
   - Click "Wrap CELO" → Sign transaction
   - Get WCELO tokens
3. **Step 2: Add Liquidity**
   - Enter BAZ amount (e.g., 100)
   - System auto-calculates WCELO ratio
   - Approve BAZ → Sign
   - Approve WCELO → Sign
   - Add Liquidity → Sign
4. **Receive LP Tokens** ✅
5. Go to **Farm** tab to stake and earn BAZ rewards

#### Remove Liquidity:
1. Click "Remove Liquidity"
2. Enter LP amount to burn
3. Receive BAZ + WCELO proportionally
4. Exit position completely

---

### 3️⃣ **🌾 Farm - Stake LP Tokens for Rewards**

**Purpose:** Earn **BAZ token rewards** by staking your LP tokens in the **MasterChef** contract.

#### How It Works:
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant MasterChef
    participant BAZToken

    User->>Frontend: View Farm dashboard
    Frontend->>MasterChef: Get pending rewards & pool info
    MasterChef-->>Frontend: Return pending BAZ, APR, total staked
    Frontend-->>User: Display: "Pending: 50 BAZ | APR: 285%"
    
    User->>Frontend: Enter LP amount to stake (e.g., 10)
    User->>Frontend: Click "Stake LP Tokens"
    Frontend->>MasterChef: Deposit LP tokens
    MasterChef->>MasterChef: Record user deposit
    
    loop Every Block (~5 seconds)
        MasterChef->>MasterChef: Emit 10 BAZ total
        MasterChef->>User: Award BAZ proportionally
    end

    User->>Frontend: Click "Harvest" anytime
    Frontend->>MasterChef: Claim pending rewards
    MasterChef->>BAZToken: Transfer BAZ to user
    BAZToken-->>User: Receive BAZ tokens 💎
```

#### Economics Example:
```
Total Staked in Pool: 1000 LP tokens
Your Stake: 100 LP tokens (10% of pool)

Daily Blocks: ~17,280 (5-second blocks)
Daily Rewards: 17,280 blocks × 10 BAZ/block = 172,800 BAZ/day (total pool)
Your Daily Reward: 10% × 172,800 BAZ = 17,280 BAZ/day

APR Calculation:
If BAZ price = $0.01
Your daily earnings = 17,280 × $0.01 = $172.80/day
Annual = $172.80 × 365 = $63,072/year
On $10,000 investment (100 LP × $100) = 630% APR
```

#### Key Features:
- ✅ **10 BAZ per block** - Consistent reward rate
- ✅ **No Lock-up Period** - Unstake anytime
- ✅ **Compound Growth** - Harvest & re-stake rewards
- ✅ **Real-time Tracking** - Pending rewards update every block (~5 seconds)
- ✅ **Emergency Withdraw** - Always exit if needed

#### User Flow:
1. **Have LP Tokens** - Complete Liquidity step first
2. Navigate to **Farm** tab
3. See:
   - Pending Rewards (BAZ owed to you)
   - Reward Rate (10 BAZ/block)
   - Pool APR (%)
   - Total Staked (LP tokens in pool)
4. **Stake LP:**
   - Enter amount
   - Approve LP tokens → Sign
   - Click "Stake" → Sign
5. **Earn Rewards:**
   - Rewards accumulate automatically every ~5 seconds
   - View "Pending Rewards" anytime
6. **Harvest (Claim):**
   - Click "Harvest Rewards"
   - Receive BAZ tokens instantly
   - Start earning again from 0
7. **Compound (Optional):**
   - Swap earned BAZ for WCELO
   - Add liquidity again
   - Stake LP for exponential growth
8. **Unstake (Exit):**
   - Enter LP amount to withdraw
   - Automatic harvest of pending rewards
   - Exit position completely

---

## 📊 User Journey & Interaction Flow

### Complete User Path (Beginner to Farmer)

```mermaid
graph LR
    A["🚀 START<br/>Connect Wallet"] --> B["1️⃣ Get Tokens<br/>BAZ from faucet"]
    B --> C["2️⃣ Wrap CELO<br/>CELO → WCELO"]
    C --> D["3️⃣ Add Liquidity<br/>BAZ + WCELO → LP Tokens"]
    D --> E["4️⃣ Approve LP<br/>Grant permission"]
    E --> F["5️⃣ Stake LP<br/>Start earning BAZ"]
    F --> G["6️⃣ Harvest<br/>Claim rewards"]
    G --> H["7️⃣ Compound<br/>Repeat cycle"]
    H --> I["💰 Earnings<br/>Account Growth"]
    
    style A fill:#FF6B6B
    style F fill:#4CAF50
    style I fill:#FFD700
```

### Feature Interaction Timeline

```mermaid
timeline
    title Daily Bazigr DeFi User Activities
    
    section Morning
      8:00 AM : Check Dashboard : View pending rewards
      8:15 AM : Harvest Rewards : Claim earned BAZ
    
    section Midday
      12:00 PM : Monitor Position : Check LP value
      12:30 PM : Optional Swap : Trade BAZ/WCELO
    
    section Afternoon
      3:00 PM : Check Prices : Monitor market
      3:30 PM : Compound (Optional) : Re-stake rewards
    
    section Evening
      6:00 PM : Review Earnings : Daily P&L
      7:00 PM : Plan Next Day : Decide add/remove liquidity
```

---

## 📊 Dashboard Metrics

The **Dashboard** displays real-time information:

| Metric | Description | Updates |
|--------|-------------|---------|
| **BAZ Balance** | Your available BAZ tokens | Every 10s |
| **WCELO Balance** | Your wrapped CELO for trading | Every 10s |
| **LP Token Balance** | Your pool share tokens | Every 10s |
| **CELO Balance** | Native CELO for gas fees | Every 10s |
| **Pending Rewards** | BAZ owed to you from farming | Every block (~5s) |
| **Pool TVL** | Total value locked (BAZ + WCELO) | Every block |
| **APR** | Annual percentage return for farmers | Real-time |
| **Your Share %** | Your portion of the pool | Every block |

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** Next.js 14+ (TypeScript)
- **UI Components:** Radix UI, Tailwind CSS
- **Animations:** Framer Motion
- **Wallet:** @reown/appkit (formerly WalletConnect)
- **Web3:** wagmi, ethers.js
- **State:** React Context API, TanStack Query

### Smart Contracts
- **Language:** Solidity 0.8+
- **DEX:** Uniswap V2 Fork (Factory + Router + Pair)
- **Farming:** MasterChef (Yield Farming)
- **Token:** ERC20 (BAZ) + Wrapped Native (WCELO)
- **Network:** Celo Sepolia Testnet (Chain ID: 11142220)
- **Framework:** Hardhat
- **Testing:** Mocha + Ethers.js + OpenZeppelin

### Infrastructure
- **Deployment:** Vercel
- **RPC:** Celo Sepolia Forno (https://forno.celo-sepolia.celo-testnet.org/)
- **Explorer:** Celo Sepolia Explorer (alfajores.celoscan.io)

---

## 🔧 Developer Integration Guide

### Setting Up Locally

```bash
# Clone repository
git clone <repo-url>
cd Bazigr

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Start development server
bun run dev
```

### Contract Interaction Example

```javascript
import { ethers } from 'ethers';

const CONTRACTS = {
  ROUTER: '0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1',
  MASTERCHEF: '0xd6f36ebA3775C25Da19D730A687Dc807b7912449',
  BAZ: '0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9',
  WCELO: '0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF',
};

// Initialize contract
const router = new ethers.Contract(
  CONTRACTS.ROUTER,
  routerABI,
  signer
);

// Example: Swap BAZ for WCELO
const path = [CONTRACTS.BAZ, CONTRACTS.WCELO];
const deadline = Math.floor(Date.now() / 1000) + 1200;

await router.swapExactTokensForTokens(
  ethers.parseEther('100'),  // 100 BAZ
  0,                          // min output
  path,
  userAddress,
  deadline
);
```

---

## ⚙️ Contract Parameters & Economics

### UniswapV2 Configuration
- **Trading Fee:** 0.3% per swap
- **Fee Destination:** 100% to Liquidity Providers
- **Price Formula:** Constant Product (x × y = k)

### MasterChef Configuration
- **Reward Rate:** 10 BAZ per block
- **Start Block:** 8,146,724 (Celo Sepolia)
- **Pool 0 Allocation:** 100 points (100% of rewards)
- **Withdraw Fee:** None (flexible farming)

### WCELO Specifications
- **Decimals:** 18
- **1 WCELO = 1 CELO**
- **Wrap/Unwrap:** 1:1 ratio

---

## 🔒 Security & Best Practices

### ✅ Implemented Security Measures
- ReentrancyGuard on all critical functions
- SafeERC20 for safe token transfers
- OpenZeppelin Access Control
- Overflow protection (Solidity 0.8+)
- Emergency withdraw functionality

### ⚠️ User Best Practices
- Start with small amounts to test
- Always verify transaction details before signing
- Keep some CELO for gas fees (~0.01 CELO minimum)
- Never share your private key or seed phrase
- Use only official Bazigr website
- Double-check contract addresses on Celo Explorer

---

## 🚀 Getting Started (Quick Start)

### For New Users
1. **Connect Wallet** → Use Celo Sepolia testnet
2. **Get Tokens** → Request BAZ from faucet
3. **Wrap CELO** → Convert native CELO to WCELO
4. **Add Liquidity** → Provide BAZ + WCELO to pool
5. **Stake LP** → Deposit LP tokens to farm
6. **Earn & Harvest** → Claim BAZ rewards

### For Developers
1. **Clone Repo** → Get all source code
2. **Install Contracts** → `cd smart-contracts && npm install`
3. **Deploy** → `npx hardhat run scripts/deploy.ts --network celoSepolia`
4. **Integrate** → Use contract ABIs from `artifacts/`
5. **Test** → Run test suite: `npm test`

---

## 📱 Supported Features

- ✅ **Token Swapping** - Trade BAZ ↔ WCELO
- ✅ **Liquidity Provision** - Add/remove liquidity
- ✅ **Yield Farming** - Stake LP for BAZ rewards
- ✅ **Real-time Dashboard** - View balances & rewards
- ✅ **Mobile Responsive** - Full mobile support
- ✅ **Wallet Integration** - Multi-wallet support
- ✅ **Transaction Tracking** - View all transactions

---

## 📞 Support & Resources

### Contract Verification
- [BAZ Token]https://sepolia.celoscan.io/address/0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9)
- [WCELO]https://sepolia.celoscan.io/address/0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF)
- [UniswapV2 Router]https://sepolia.celoscan.io/address/0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1)
- [MasterChef]https://sepolia.celoscan.io/address/0xd6f36ebA3775C25Da19D730A687Dc807b7912449)

### Documentation
- 📖 [DEFI_USER_GUIDE.md](./DEFI_USER_GUIDE.md) - Complete user guide
- 📋 [DEPLOYMENT_SUMMARY_DEFI.md](./smart-contracts/DEPLOYMENT_SUMMARY_DEFI.md) - Technical details
- 🔧 [FRONTEND_INTEGRATION.md](./smart-contracts/FRONTEND_INTEGRATION.md) - Developer guide

### Network Info
- **Network:** Celo Sepolia Testnet
- **Chain ID:** 11142220
- **RPC:** https://forno.celo-sepolia.celo-testnet.org/
- **Explorer:** https://alfajores.celoscan.io/

---

## 📈 Roadmap & Future Features

- 🔮 **AI DeFi Agent** - Smart recommendations for farming strategies
- 🎮 **Mini-Games** - Play-to-earn mechanics
- 🏆 **Leaderboard** - Competitive trading rankings
- 🌉 **Cross-Chain Bridge** - Multi-network support
- 💳 **Lending/Borrowing** - Additional DeFi primitives
- 🎨 **NFT Badges** - Achievement collection

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

**🎉 Start your DeFi journey with Bazigr today!**

**Network:** Celo Sepolia | **Chain ID:** 11142220  
**Version:** 1.0 | **Last Updated:** October 26, 2025
