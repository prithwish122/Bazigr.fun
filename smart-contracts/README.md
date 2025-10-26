# Bazigr DeFi Protocol - Smart Contracts Documentation

## 🌐 Network
**Celo Sepolia Testnet** (Chain ID: 44787)
- RPC: `https://forno.celo-sepolia.celo-testnet.org/`
- Explorer: `https://celo-alfajores.blockscout.com/`

---

## 📜 Deployed Contracts

### 1. **BAZ Token (ERC20)**
**Address:** `0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9`

**Purpose:** The native governance and utility token of the Bazigr ecosystem.

**Key Features:**
- ERC20 compliant token
- Total Supply: 10 Trillion BAZ (10,000,000,000,000 tokens)
- 18 decimals
- Used for:
  - Providing liquidity in pools
  - Earning farming rewards
  - Governance (future implementation)

**Functions:**
```solidity
balanceOf(address account) → uint256        // Check BAZ balance
transfer(address to, uint256 amount)        // Transfer BAZ tokens
approve(address spender, uint256 amount)    // Approve spending
```

---

### 2. **WCELO (Wrapped CELO)**
**Address:** `0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF`

**Purpose:** ERC20 wrapper for native CELO token to enable AMM trading.

**Key Features:**
- Wraps native CELO into ERC20 format
- 1:1 backing (1 WCELO = 1 CELO)
- Required for AMM liquidity pools
- 18 decimals

**Functions:**
```solidity
deposit()                                   // Wrap CELO → WCELO (payable)
withdraw(uint256 amount)                    // Unwrap WCELO → CELO
balanceOf(address account) → uint256        // Check WCELO balance
```

**How to Use:**
```javascript
// Wrap CELO to WCELO
await wcelo.deposit({ value: parseEther("1.0") });

// Unwrap WCELO to CELO
await wcelo.withdraw(parseEther("1.0"));
```

---

### 3. **UniswapV2Factory**
**Address:** `0x79708C6Fa5b5cEaB94d7c84D118118cfe87c79c9`

**Purpose:** Creates and manages all trading pairs in the DEX.

**Key Features:**
- Creates unique pair contracts for any token combination
- Prevents duplicate pairs
- Uses CREATE2 for deterministic pair addresses
- Emits `PairCreated` events

**Functions:**
```solidity
createPair(address tokenA, address tokenB) → address pair
getPair(address tokenA, address tokenB) → address pair
allPairs(uint256 index) → address pair
allPairsLength() → uint256
```

**Example:**
```javascript
const pairAddress = await factory.getPair(BAZ_TOKEN, WCELO);
console.log("BAZ/WCELO Pair:", pairAddress);
```

---

### 4. **UniswapV2Router**
**Address:** `0xB31Ef6E512d34508CA768df50a8fF0d328553C89`

**Purpose:** Main interface for adding/removing liquidity and swapping tokens.

**Key Features:**
- Simplified interface for liquidity operations
- Automatic pair creation if needed
- Slippage protection
- Deadline checks to prevent stale transactions

**Functions:**
```solidity
addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
) → (uint256 amountA, uint256 amountB, uint256 liquidity)

removeLiquidity(
    address tokenA,
    address tokenB,
    uint256 liquidity,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
) → (uint256 amountA, uint256 amountB)

swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] path,
    address to,
    uint256 deadline
) → uint256[] amounts

getAmountsOut(uint256 amountIn, address[] path) → uint256[] amounts
```

**⚠️ Known Issue:** `addLiquidity()` currently fails. Use direct pair minting instead (see workaround below).

---

### 5. **BAZ/WCELO Pair (UniswapV2Pair)**
**Address:** `0x7fDC7A41Fe9878f27e3494A0dca8DF7cf8D5BAEa`

**Purpose:** Automated Market Maker (AMM) pool for BAZ ↔ WCELO trading.

**Key Features:**
- Constant Product Formula: `x * y = k`
- Provides liquidity for token swaps
- Issues LP tokens representing pool ownership
- 0.3% swap fee (0.25% to LPs, 0.05% protocol fee potential)

**Current Reserves:**
- BAZ: ~253 BAZ
- WCELO: ~1.568 WCELO
- Total LP Supply: ~16 LP tokens

**Functions:**
```solidity
getReserves() → (uint112 reserve0, uint112 reserve1, uint32 timestamp)
token0() → address
token1() → address
mint(address to) → uint256 liquidity
burn(address to) → (uint256 amount0, uint256 amount1)
swap(uint256 amount0Out, uint256 amount1Out, address to, bytes data)
sync()                                      // Force reserves to match balances
```

**Workaround for Adding Liquidity:**
```javascript
// Transfer tokens directly to pair
await bazToken.transfer(pairAddress, bazAmount);
await wcelo.transfer(pairAddress, wceloAmount);

// Mint LP tokens
await pair.mint(yourAddress);
```

---

### 6. **MasterChef (Yield Farming)**
**Address:** `0x5Fc0612f264aAceF796cd08BaCb085E69cd813A4`

**Purpose:** Manages yield farming rewards for LP token stakers.

**Key Features:**
- Rewards stakers with BAZ tokens
- Configurable reward rate per block
- Multiple pool support
- Automatic reward calculation

**Configuration:**
- **BAZ per Block:** 10 BAZ
- **Start Block:** 8,151,702
- **Initial Funding:** 1,000,000 BAZ
- **Pool 0:** BAZ/WCELO LP (100 allocation points)

**Functions:**
```solidity
deposit(uint256 poolId, uint256 amount)    // Stake LP tokens
withdraw(uint256 poolId, uint256 amount)   // Unstake LP tokens
harvest(uint256 poolId)                    // Claim rewards
pendingBAZ(uint256 poolId, address user) → uint256
getUserStaked(uint256 poolId, address user) → uint256
getPoolTotalStaked(uint256 poolId) → uint256
```

**Example Usage:**
```javascript
// Approve LP tokens
await lpToken.approve(masterChefAddress, amount);

// Stake LP tokens
await masterChef.deposit(0, amount);

// Check pending rewards
const pending = await masterChef.pendingBAZ(0, yourAddress);

// Harvest rewards
await masterChef.harvest(0);

// Unstake
await masterChef.withdraw(0, amount);
```

---

## 🔄 Complete Workflow

### A. Adding Liquidity (Direct Method - Recommended)

```javascript
// 1. Approve tokens to pair contract
await bazToken.approve(pairAddress, bazAmount);
await wcelo.approve(pairAddress, wceloAmount);

// 2. Transfer tokens to pair
await bazToken.transfer(pairAddress, bazAmount);
await wcelo.transfer(pairAddress, wceloAmount);

// 3. Mint LP tokens
const tx = await pair.mint(yourAddress);
await tx.wait();

// Result: You receive LP tokens proportional to your share
```

### B. Removing Liquidity

```javascript
// 1. Approve LP tokens to router
await lpToken.approve(routerAddress, lpAmount);

// 2. Remove liquidity
await router.removeLiquidity(
    BAZ_TOKEN,
    WCELO,
    lpAmount,
    minBazAmount,    // Slippage protection
    minWceloAmount,  // Slippage protection
    yourAddress,
    deadline
);

// Result: You receive BAZ and WCELO tokens back
```

### C. Swapping Tokens

```javascript
// 1. Approve input token
await bazToken.approve(routerAddress, amountIn);

// 2. Get expected output amount
const path = [BAZ_TOKEN, WCELO];
const amountsOut = await router.getAmountsOut(amountIn, path);
const expectedOutput = amountsOut[1];

// 3. Execute swap
await router.swapExactTokensForTokens(
    amountIn,
    expectedOutput * 0.95,  // 5% slippage tolerance
    path,
    yourAddress,
    deadline
);

// Result: You receive WCELO tokens
```

### D. Yield Farming

```javascript
// 1. Get LP tokens (see section A)

// 2. Approve LP tokens to MasterChef
await lpToken.approve(masterChefAddress, lpAmount);

// 3. Deposit (stake) LP tokens
await masterChef.deposit(0, lpAmount);  // Pool 0 = BAZ/WCELO

// 4. Wait for rewards to accumulate (10 BAZ per block)

// 5. Check pending rewards
const pending = await masterChef.pendingBAZ(0, yourAddress);
console.log("Pending BAZ:", formatEther(pending));

// 6. Harvest rewards
await masterChef.harvest(0);

// 7. Withdraw LP tokens (if desired)
await masterChef.withdraw(0, lpAmount);

// Result: You earn BAZ rewards over time
```

---

## 📊 Mathematical Formulas

### Constant Product Formula (AMM)
```
x * y = k

Where:
- x = Reserve of Token A (BAZ)
- y = Reserve of Token B (WCELO)
- k = Constant product

Price = y / x
```

### LP Token Calculation (First Liquidity)
```
liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY

MINIMUM_LIQUIDITY = 1000 (locked forever at address(1))
```

### LP Token Calculation (Subsequent Liquidity)
```
liquidity = min(
    (amountA * totalSupply) / reserveA,
    (amountB * totalSupply) / reserveB
)
```

### Swap Output (with 0.3% fee)
```
amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)

Fee = amountIn * 0.003
```

### Farming Rewards
```
rewardsPerBlock = BAZ_PER_BLOCK * (poolAllocPoints / totalAllocPoints)

userRewards = (userStaked / totalStaked) * rewardsPerBlock * blocksPassed
```

---

## 🔧 Troubleshooting

### Issue: Router.addLiquidity() Fails
**Cause:** ReentrancyGuard incompatibility in OpenZeppelin v5

**Solution:** Use direct pair minting (see section A above)

### Issue: Transaction Reverts with No Error
**Cause:** Insufficient token balance or approval

**Solution:**
```javascript
// Check balances
const bazBal = await bazToken.balanceOf(yourAddress);
const wceloBal = await wcelo.balanceOf(yourAddress);

// Check allowances
const bazAllowance = await bazToken.allowance(yourAddress, pairAddress);
const wceloAllowance = await wcelo.allowance(yourAddress, pairAddress);
```

### Issue: Pool Reserves Not Updating
**Cause:** Frontend caching or RPC lag

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Click the refresh button (🔄) in the UI
3. Check block explorer for actual on-chain data

---

## 🔐 Security Considerations

1. **Slippage Protection:** Always set `minAmount` parameters to prevent front-running
2. **Deadline:** Use reasonable deadline values (e.g., 20 minutes)
3. **Approval Management:** Revoke unused approvals periodically
4. **Testnet Only:** These contracts are deployed on testnet - DO NOT use with real funds
5. **Audit Status:** Not audited - use at your own risk

---

## 📞 Contract Interactions

### Block Explorer Links
- [BAZ Token](https://celo-alfajores.blockscout.com/address/0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9)
- [WCELO](https://celo-alfajores.blockscout.com/address/0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF)
- [Factory](https://celo-alfajores.blockscout.com/address/0x79708C6Fa5b5cEaB94d7c84D118118cfe87c79c9)
- [Router](https://celo-alfajores.blockscout.com/address/0xB31Ef6E512d34508CA768df50a8fF0d328553C89)
- [BAZ/WCELO Pair](https://celo-alfajores.blockscout.com/address/0x7fDC7A41Fe9878f27e3494A0dca8DF7cf8D5BAEa)
- [MasterChef](https://celo-alfajores.blockscout.com/address/0x5Fc0612f264aAceF796cd08BaCb085E69cd813A4)

### Frontend Integration
The frontend is configured in `src/app/contract/defi-config.ts`:
```typescript
export const DEFI_CONTRACTS = {
  BAZ_TOKEN: "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9",
  WCELO: "0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF",
  FACTORY: "0x79708C6Fa5b5cEaB94d7c84D118118cfe87c79c9",
  ROUTER: "0xB31Ef6E512d34508CA768df50a8fF0d328553C89",
  MASTERCHEF: "0x5Fc0612f264aAceF796cd08BaCb085E69cd813A4",
  BAZ_WCELO_PAIR: "0x7fDC7A41Fe9878f27e3494A0dca8DF7cf8D5BAEa",
};
```

---

## 🚀 Quick Start Scripts

### Check Balances
```bash
npx hardhat run scripts/check-balances.ts --network celoSepolia
```

### Check Pool Status
```bash
npx hardhat run scripts/check-pool-status.ts --network celoSepolia
```

### Add Liquidity (Script)
```bash
npx hardhat run scripts/add-liquidity-final.ts --network celoSepolia
```

### Wrap CELO
```bash
npx hardhat run scripts/wrap-celo.ts --network celoSepolia
```

---

## 📝 Deployment Info

- **Deployment Date:** October 25, 2025
- **Deployer Address:** `0x199831720f23892aF7Bd38643008C6Ff30d5228f`
- **Network:** Celo Sepolia Testnet
- **Hardhat Version:** 3.0.6
- **Solidity Version:** 0.8.28
- **OpenZeppelin:** 5.4.0

---

## 🎯 Summary

This DeFi protocol provides:
1. ✅ **Token Swapping** - Trade BAZ ↔ WCELO via AMM
2. ✅ **Liquidity Provision** - Earn fees by providing liquidity
3. ✅ **Yield Farming** - Stake LP tokens to earn BAZ rewards
4. ✅ **CELO Wrapping** - Convert CELO ↔ WCELO

**Total Value Locked (TVL):**
- ~253 BAZ
- ~1.568 WCELO
- ~16 LP tokens staked

**Daily Rewards:** ~10 BAZ per block × ~17,280 blocks/day = ~172,800 BAZ/day

---

## 📚 Additional Resources

- [Uniswap V2 Documentation](https://docs.uniswap.org/contracts/v2/overview)
- [Celo Developer Docs](https://docs.celo.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

**⚠️ DISCLAIMER:** These contracts are deployed on testnet for development and testing purposes only. Do not use with real funds on mainnet without proper auditing and security review.

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
