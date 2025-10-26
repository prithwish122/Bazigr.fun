# 🎯 Bazigr DeFi Module - Complete Documentation

## 📋 Overview

This is a **production-ready DeFi module** for the Bazigr platform on Celo Sepolia testnet. It includes:

1. **Uniswap V2-style AMM** (Factory + Router + Pair) for token swaps and liquidity provision
2. **MasterChef Yield Farming** for LP token staking and BAZ token rewards
3. **WCELO** (Wrapped CELO) for native token trading

## 🚀 Deployed Contracts (Celo Sepolia)

| Contract | Address |
|----------|---------|
| **BAZ Token** (existing) | `0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9` |
| **WCELO** | `0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF` |
| **Uniswap V2 Factory** | `0xf29E685888FbF4f5AADbA8a3dF2499EfF6BFfE1C` |
| **Uniswap V2 Router** | `0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1` |
| **MasterChef** | `0xd6f36ebA3775C25Da19D730A687Dc807b7912449` |

### Liquidity Pairs

| Pair | Address |
|------|---------|
| **BAZ/WCELO** | `0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14` |

### MasterChef Pools

| Pool ID | Pair | Allocation Points | APR |
|---------|------|-------------------|-----|
| 0 | BAZ/WCELO | 100 | Variable |

**Configuration:**
- BAZ per block: 10 BAZ
- Farming start block: 8146724

## 🏗️ Architecture

### 1. Uniswap V2 AMM

The AMM consists of three core contracts:

#### UniswapV2Factory
- Creates new liquidity pairs
- Manages pair registry
- Deterministic pair addresses using CREATE2

#### UniswapV2Pair
- ERC20 LP tokens representing liquidity positions
- Implements constant product formula (x * y = k)
- 0.3% trading fee
- Protects against reentrancy

#### UniswapV2Router
- User-facing contract for interactions
- Add/remove liquidity
- Token swaps (exact input/output)
- Price quote functions

### 2. MasterChef (Yield Farming)

- Stake LP tokens to earn BAZ rewards
- Multiple pool support with allocation points
- Pre-funded reward system (no minting)
- Emergency withdraw functionality
- Harvest rewards independently

### 3. WCELO

- Wrapped native CELO token
- Enables CELO trading in pairs
- Standard ERC20 interface

## 📖 Usage Guide

### For Users

#### 1. Wrap CELO
```solidity
// Send CELO to WCELO contract
wcelo.deposit{value: amount}();

// Or unwrap
wcelo.withdraw(amount);
```

#### 2. Add Liquidity
```solidity
// Approve tokens
bazToken.approve(routerAddress, bazAmount);
wcelo.approve(routerAddress, wceloAmount);

// Add liquidity
router.addLiquidity(
    bazTokenAddress,
    wceloAddress,
    bazAmount,
    wceloAmount,
    minBazAmount,
    minWceloAmount,
    to,
    deadline
);
```

#### 3. Swap Tokens
```solidity
// Approve input token
bazToken.approve(routerAddress, amountIn);

// Swap BAZ for WCELO
address[] memory path = new address[](2);
path[0] = bazTokenAddress;
path[1] = wceloAddress;

router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    to,
    deadline
);
```

#### 4. Stake LP Tokens (Yield Farming)
```solidity
// Approve LP tokens
lpToken.approve(masterChefAddress, amount);

// Deposit to pool 0 (BAZ/WCELO)
masterChef.deposit(0, amount);

// Check pending rewards
uint256 pending = masterChef.pendingBAZ(0, userAddress);

// Harvest rewards
masterChef.harvest(0);

// Withdraw LP tokens
masterChef.withdraw(0, amount);
```

### For Admins

#### Fund MasterChef with Rewards
```solidity
// Approve BAZ tokens
bazToken.approve(masterChefAddress, rewardAmount);

// Fund the contract
masterChef.fundRewards(rewardAmount);
```

#### Add New Pool
```solidity
// Add new LP pool
masterChef.add(
    allocPoint,      // e.g., 100
    lpTokenAddress,  // LP token address
    withUpdate       // true to update all pools
);
```

#### Update Pool Allocation
```solidity
masterChef.set(
    poolId,          // Pool ID
    newAllocPoint,   // New allocation points
    withUpdate       // true to update all pools
);
```

#### Update Reward Rate
```solidity
masterChef.updateBAZPerBlock(newBazPerBlock);
```

## 🔒 Security Features

1. **ReentrancyGuard** - All state-changing functions protected
2. **SafeERC20** - Safe token transfers
3. **Access Control** - Ownable pattern for admin functions
4. **Integer Overflow Protection** - Solidity 0.8+ built-in
5. **Emergency Withdraw** - Users can withdraw LP tokens without rewards
6. **Slippage Protection** - Min amount parameters in router

## 🧪 Testing

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy-defi.ts --network celoSepolia
```

## 📊 Frontend Integration

### Contract ABIs

ABIs are available in the `artifacts` directory:
- `artifacts/contracts/UniswapV2Factory.sol/UniswapV2Factory.json`
- `artifacts/contracts/UniswapV2Router.sol/UniswapV2Router.json`
- `artifacts/contracts/UniswapV2Pair.sol/UniswapV2Pair.json`
- `artifacts/contracts/MasterChef.sol/MasterChef.json`
- `artifacts/contracts/WCELO.sol/WCELO.json`

### Example React Integration

```typescript
import { ethers } from 'ethers';
import RouterABI from './abis/UniswapV2Router.json';
import MasterChefABI from './abis/MasterChef.json';

// Initialize contracts
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const router = new ethers.Contract(
  '0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1',
  RouterABI.abi,
  signer
);

const masterChef = new ethers.Contract(
  '0xd6f36ebA3775C25Da19D730A687Dc807b7912449',
  MasterChefABI.abi,
  signer
);

// Get pending rewards
const pending = await masterChef.pendingBAZ(0, userAddress);

// Add liquidity
const tx = await router.addLiquidity(
  bazToken,
  wceloToken,
  bazAmount,
  wceloAmount,
  minBaz,
  minWcelo,
  userAddress,
  deadline
);
await tx.wait();
```

## 🎨 Features

### AMM Features
- ✅ Create any ERC20/ERC20 pair
- ✅ Add/remove liquidity
- ✅ Token swaps with optimal routing
- ✅ Price impact calculation
- ✅ Slippage protection
- ✅ LP token minting/burning

### Yield Farming Features
- ✅ Multi-pool staking
- ✅ Configurable reward distribution
- ✅ Real-time reward calculation
- ✅ Independent harvest
- ✅ Emergency withdraw
- ✅ Pool management

## 📈 Economics

### Trading Fees
- **0.3%** fee on all swaps
- Fees distributed to LP providers
- No protocol fee

### Reward Distribution
- **10 BAZ per block** distributed across all pools
- Rewards proportional to pool allocation points
- BAZ/WCELO pool: 100 allocation points (100%)

### Liquidity Mining
- Stake LP tokens to earn BAZ
- Rewards accrue every block
- Harvest anytime
- No lock-up period

## 🛠️ Development

### Project Structure
```
contracts/
├── UniswapV2Factory.sol    # Pair factory
├── UniswapV2Pair.sol       # LP token & AMM logic
├── UniswapV2Router.sol     # User interface
├── MasterChef.sol          # Yield farming
├── WCELO.sol               # Wrapped CELO
└── Bazigar.sol             # BAZ token (existing)

scripts/
├── deploy-defi.ts          # Main deployment script
└── fund-masterchef.ts      # Fund rewards script
```

### Compile
```bash
npx hardhat compile
```

### Deploy
```bash
npx hardhat run scripts/deploy-defi.ts --network celoSepolia
```

### Verify Contracts
```bash
npx hardhat verify --network celoSepolia <CONTRACT_ADDRESS>
```

## ⚠️ Important Notes

1. **Fund MasterChef**: The MasterChef contract must be pre-funded with BAZ tokens for rewards
2. **Approve Tokens**: Users must approve tokens before adding liquidity or staking
3. **Deadlines**: All router transactions require a deadline parameter
4. **Slippage**: Set appropriate minimum amounts to protect against price changes
5. **Gas Costs**: Complex operations (adding liquidity + staking) can be gas-intensive

## 🔗 Useful Links

- [Celo Sepolia Explorer](https://celo-alfajores.blockscout.com/)
- [Celo Faucet](https://faucet.celo.org/)
- [Uniswap V2 Docs](https://docs.uniswap.org/protocol/V2/introduction)
- [MasterChef Pattern](https://github.com/sushiswap/sushiswap)

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please ensure all tests pass before submitting PRs.

---

**Built with ❤️ for Bazigr on Celo**
