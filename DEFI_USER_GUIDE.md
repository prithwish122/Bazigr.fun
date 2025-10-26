# 🚀 Quick Start Guide: Bazigr DeFi

## Prerequisites
✅ Wallet connected to Celo Sepolia testnet  
✅ Some CELO for gas fees  
✅ BAZ tokens in your wallet  

## Features Overview

### 💧 Liquidity
Add or remove liquidity to the BAZ/WCELO pool to earn trading fees.

### 🔄 Swap
Trade BAZ ↔ WCELO directly with automatic pricing.

### 🌾 Farm
Stake LP tokens to earn BAZ rewards every block.

---

## Step-by-Step Instructions

### 1️⃣ Adding Liquidity

**Purpose:** Provide liquidity to the pool and earn trading fees + LP tokens

1. Go to **Liquidity** tab
2. If you have CELO but no WCELO:
   - Enter amount in WCELO field
   - Click **"Wrap CELO"** button
   - Wait for confirmation
3. Enter equal value of BAZ and WCELO
   - Example: 100 BAZ + 0.5 WCELO
4. Click **"Add Liquidity"**
5. Approve BAZ (sign transaction)
6. Approve WCELO (sign transaction)
7. Confirm liquidity addition (sign transaction)
8. Receive LP tokens automatically

**You Now Have:**
- LP tokens representing your share of the pool
- You earn 0.3% of all trading fees proportionally

---

### 2️⃣ Swapping Tokens

**Purpose:** Exchange BAZ for WCELO (or vice versa)

1. Go to **Swap** tab
2. Select token to swap FROM (BAZ or WCELO)
3. Enter amount
4. See calculated output automatically
5. Review exchange rate and fee
6. Click **"Swap"**
7. Approve token (sign transaction)
8. Confirm swap (sign transaction)
9. Tokens swapped instantly!

**Notes:**
- 0.3% trading fee applies
- 5% slippage protection included
- Real-time pricing based on pool reserves

---

### 3️⃣ Farming/Staking

**Purpose:** Earn BAZ rewards by staking your LP tokens

**First, Get LP Tokens:**
- Complete Step 1 (Adding Liquidity) first
- LP tokens appear in your LP Token balance

**Then Stake:**
1. Go to **Farm** tab
2. Check "Pending Rewards" and "Reward Rate"
3. Enter LP amount to stake
4. Click **"Stake LP Tokens"**
5. Approve LP tokens (sign transaction)
6. Confirm stake (sign transaction)
7. Start earning rewards immediately!

**Manage Your Farm:**
- **Harvest:** Claim pending rewards anytime
  - Click "Harvest Rewards" button
  - Receive BAZ tokens
- **Unstake:** Withdraw LP tokens anytime
  - Enter amount in "Unstake Amount"
  - Click "Unstake"
  - Automatically harvests pending rewards

**Rewards Info:**
- 10 BAZ per block (~5 second blocks)
- No lock-up period
- Rewards compound as you accumulate

---

### 4️⃣ Removing Liquidity

**Purpose:** Get your BAZ and WCELO back from the pool

1. Go to **Liquidity** tab
2. Scroll to "Remove Liquidity" section
3. Enter LP token amount to burn
4. Click **"Remove Liquidity"**
5. Approve LP tokens (sign transaction)
6. Confirm removal (sign transaction)
7. Receive BAZ and WCELO proportionally

**Important:**
- Unstake from farm FIRST if you have staked LP
- Then remove liquidity
- You get back the value based on current pool ratio

---

## 💡 Pro Tips

### Gas Optimization
- Batch operations when possible
- Harvest rewards when amount is meaningful
- Add/remove liquidity in larger chunks

### Maximize Earnings
1. Add liquidity → Earn trading fees
2. Stake LP tokens → Earn BAZ rewards
3. Harvest regularly → Compound rewards
4. Consider market conditions before swapping

### Safety
- Always check transaction details before signing
- Start with small amounts to test
- Keep some CELO for gas fees
- Monitor your positions in the dashboard

---

## 📊 Dashboard Overview

**Top Balance Cards:**
- **BAZ Balance** - Your token balance
- **WCELO Balance** - Wrapped CELO for trading
- **LP Tokens** - Your pool share tokens
- **CELO Balance** - Native CELO for gas

**Auto-Refresh:** All balances update every 10 seconds

---

## 🔧 Troubleshooting

### "Transaction Reverted"
- Check you have enough balance
- Ensure token approvals succeeded
- Try wrapping CELO first if needed
- Verify pool has liquidity (for swaps)

### "Insufficient Balance"
- Wrap more CELO to WCELO
- Get BAZ tokens from bridge/faucet
- Keep CELO for gas fees

### "Approval Failed"
- Retry approval transaction
- Check wallet has enough CELO for gas
- Clear old approvals if needed

### High Slippage
- Pool may have low liquidity
- Try smaller swap amounts
- Add liquidity to improve pool depth

---

## 📈 Understanding APR

**Liquidity Providers Earn:**
1. **Trading Fees:** 0.3% of all swaps
   - Proportional to your pool share
2. **Staking Rewards:** 10 BAZ/block
   - Proportional to your farm stake
   - ~17,280 blocks/day = 172,800 BAZ/day (total pool)

**Your Share:**
- If you have 10% of staked LP
- You earn 10% of daily rewards
- = 17,280 BAZ per day

---

## 🎯 Quick Actions

| Action | Tabs Required | Transactions |
|--------|---------------|--------------|
| Start Earning | Liquidity → Farm | 3-5 tx |
| Swap Tokens | Swap | 2 tx |
| Harvest | Farm | 1 tx |
| Exit Position | Farm → Liquidity | 2-3 tx |

---

## 📱 Mobile Usage

- Fully responsive design
- All features work on mobile
- Use WalletConnect for mobile wallets
- Optimized touch targets

---

## ⚡ Advanced Features

### Wrapping/Unwrapping
- CELO → WCELO: Use "Wrap CELO" button
- WCELO → CELO: Swap WCELO for something else, then unwrap (future feature)

### Multiple Operations
- Add liquidity + Stake in one session
- Harvest + Compound (stake rewards)
- Unstake + Remove liquidity

---

## 🎁 Rewards Calculator

**Example Scenario:**
- You add: 1000 BAZ + 5 WCELO
- Pool total: 10,000 BAZ + 50 WCELO
- Your share: 10%

**Daily Earnings:**
- Trading fees: Variable (depends on volume)
- Farming rewards: 17,280 BAZ (if 10% of staked LP)

---

## 📞 Support

**Contract Addresses:**
```
Router: 0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1
MasterChef: 0xd6f36ebA3775C25Da19D730A687Dc807b7912449
BAZ/WCELO Pair: 0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14
```

**Need Help?**
- Check transaction on Celo Explorer
- Review balances in dashboard
- Ensure wallet is connected
- Verify network is Celo Sepolia

---

**🎉 Happy Trading on Bazigr DeFi!**
