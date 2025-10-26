# 🎯 Bazigr DeFi - Quick Reference Guide

## 📍 Contract Addresses (Celo Sepolia)

```javascript
const CONTRACTS = {
  BAZ_TOKEN: "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9",
  WCELO: "0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF",
  FACTORY: "0xf29E685888FbF4f5AADbA8a3dF2499EfF6BFfE1C",
  ROUTER: "0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1",
  MASTERCHEF: "0xd6f36ebA3775C25Da19D730A687Dc807b7912449",
  BAZ_WCELO_PAIR: "0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14"
};
```

## 🔧 Common Operations

### Swap BAZ for WCELO
```solidity
// 1. Approve BAZ
bazToken.approve(ROUTER, amountIn);

// 2. Swap
router.swapExactTokensForTokens(
  amountIn,
  amountOutMin,
  [BAZ_TOKEN, WCELO],
  recipient,
  deadline
);
```

### Add Liquidity
```solidity
// 1. Approve both tokens
bazToken.approve(ROUTER, bazAmount);
wcelo.approve(ROUTER, celoAmount);

// 2. Add liquidity
router.addLiquidity(
  BAZ_TOKEN,
  WCELO,
  bazAmount,
  celoAmount,
  minBaz,
  minCelo,
  recipient,
  deadline
);
```

### Stake LP Tokens
```solidity
// 1. Approve LP tokens
lpToken.approve(MASTERCHEF, amount);

// 2. Deposit to pool 0
masterChef.deposit(0, amount);
```

### Harvest Rewards
```solidity
masterChef.harvest(0);
```

### Withdraw LP Tokens
```solidity
masterChef.withdraw(0, amount);
```

## 📊 View Functions

```solidity
// Get pending rewards
uint256 pending = masterChef.pendingBAZ(0, userAddress);

// Get user staked amount
uint256 staked = masterChef.getUserStaked(0, userAddress);

// Get pool total staked
uint256 totalStaked = masterChef.getPoolTotalStaked(0);

// Get pair reserves
(uint112 reserve0, uint112 reserve1,) = pair.getReserves();

// Get amount out for swap
uint256 amountOut = router.getAmountOut(amountIn, reserveIn, reserveOut);
```

## 🎨 Frontend Code Snippets

### Connect Wallet
```typescript
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();
```

### Get Router Contract
```typescript
import RouterABI from './abis/UniswapV2Router.json';

const router = new ethers.Contract(
  "0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1",
  RouterABI.abi,
  signer
);
```

### Swap Tokens
```typescript
async function swap(amountIn: string, minOut: string) {
  const deadline = Math.floor(Date.now() / 1000) + 1200;
  const tx = await router.swapExactTokensForTokens(
    ethers.utils.parseEther(amountIn),
    ethers.utils.parseEther(minOut),
    [BAZ_TOKEN, WCELO],
    await signer.getAddress(),
    deadline
  );
  await tx.wait();
}
```

### Check Rewards
```typescript
async function checkRewards(userAddress: string) {
  const masterChef = new ethers.Contract(
    MASTERCHEF,
    MasterChefABI.abi,
    provider
  );
  
  const pending = await masterChef.pendingBAZ(0, userAddress);
  return ethers.utils.formatEther(pending);
}
```

## ⚡ Admin Functions

### Fund MasterChef
```bash
npx hardhat run scripts/fund-masterchef.ts --network celoSepolia
```

### Add New Pool
```solidity
masterChef.add(allocPoint, lpTokenAddress, true);
```

### Update Reward Rate
```solidity
masterChef.updateBAZPerBlock(newRate);
```

## 📈 Reward Calculations

```
Rewards per block: 10 BAZ
Blocks per day: ~17,280 (5s blocks)
Daily rewards: 172,800 BAZ
User share: (userStake / totalStake) * dailyRewards
```

## 🔒 Important Notes

1. **Always set deadline**: `Math.floor(Date.now() / 1000) + 1200` (20 min)
2. **Use slippage protection**: Set `amountOutMin` to prevent sandwich attacks
3. **Check allowances**: Approve tokens before operations
4. **Fund MasterChef**: Contract needs BAZ tokens for rewards
5. **Wei amounts**: Use `parseEther()` for token amounts

## 🌐 Network Info

- **Network**: Celo Sepolia (Alfajores)
- **Chain ID**: 44787
- **RPC**: https://alfajores-forno.celo-testnet.org
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org

## 📝 Testing Checklist

- [ ] Wrap CELO to WCELO
- [ ] Approve BAZ and WCELO for Router
- [ ] Add liquidity to BAZ/WCELO pool
- [ ] Perform a swap (BAZ → WCELO)
- [ ] Approve LP tokens for MasterChef
- [ ] Deposit LP tokens to Pool 0
- [ ] Check pending rewards
- [ ] Harvest rewards
- [ ] Withdraw LP tokens
- [ ] Emergency withdraw (test on small amount)

## 🚨 Emergency Procedures

### Emergency Withdraw (Users)
```solidity
masterChef.emergencyWithdraw(0); // Forfeit rewards, get LP back
```

### Pause Operations (Owner)
```solidity
// Update reward rate to 0
masterChef.updateBAZPerBlock(0);
```

## 📚 Resources

- Deployment Summary: `DEPLOYMENT_SUMMARY_DEFI.md`
- Full Documentation: `README_DEFI.md`
- Deployment Data: `deployment-defi.json`
- ABIs: `artifacts/contracts/`

---

**Quick Start**: Fund MasterChef → Add Liquidity → Start Farming! 🚀
