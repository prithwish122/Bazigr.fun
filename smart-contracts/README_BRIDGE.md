# Bazigr Cross-Chain Bridge

A complete cross-chain bridge solution for the Bazigr (BAZ) token, enabling seamless transfers between U2U and Sepolia networks.

## 🌉 Bridge Overview

The Bazigr Bridge consists of two smart contracts deployed on different networks:
- **U2U Bridge**: Locks tokens on U2U network, unlocks on Sepolia
- **Sepolia Bridge**: Locks tokens on Sepolia network, unlocks on U2U

## 🏗️ Architecture

```
U2U Network                    Sepolia Network
┌─────────────────┐           ┌─────────────────┐
│   Bazigr Token  │           │   Bazigr Token  │
│   (0xC345f...)  │           │   (0xD5e91...)  │
└─────────────────┘           └─────────────────┘
         │                             │
         │                             │
┌─────────────────┐           ┌─────────────────┐
│  U2U Bridge     │           │ Sepolia Bridge   │
│  (Lock/Unlock)  │           │  (Lock/Unlock)  │
└─────────────────┘           └─────────────────┘
```

## 🚀 Quick Start

### 1. Environment Setup

Create `.env` file in `smart-contracts` directory:

```bash
# U2U Network
U2U_RPC_URL=https://rpc-mainnet.u2u.xyz
U2U_PRIVATE_KEY=your_u2u_private_key

# Sepolia Network  
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key
INFURA_API_KEY=your_infura_api_key
```

### 2. Deploy Contracts

```bash
# Deploy to both networks
npx hardhat run scripts/deploy-bridge-complete.ts --network u2uMainnet
npx hardhat run scripts/deploy-bridge-complete.ts --network sepolia
```

### 3. Fund Bridge Contracts

```bash
# Fund both bridges with initial liquidity
npx hardhat run scripts/fund-bridge-complete.ts --network u2uMainnet
npx hardhat run scripts/fund-bridge-complete.ts --network sepolia
```

### 4. Update Frontend

Update contract addresses in `client/src/app/components/bridge/bridge-box.tsx`:

```typescript
const U2U_BRIDGE_ADDRESS = "0x..."; // Your deployed U2U bridge address
const SEPOLIA_BRIDGE_ADDRESS = "0x..."; // Your deployed Sepolia bridge address
```

## 🔧 Smart Contract Features

### Core Functions

| Function | Description | Access |
|----------|-------------|---------|
| `lockTokens(uint256 amount)` | Lock tokens for bridging | Public |
| `unlockTokens(address user, uint256 amount, uint256 nonce)` | Unlock tokens after bridging | Owner only |
| `getUserNonce(address user)` | Get user's current nonce | Public |
| `getBridgeBalance()` | Get bridge contract balance | Public |

### Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Nonce System**: Prevents replay attacks
- **Owner Controls**: Secure token unlocking

### Events

```solidity
event TokensLocked(address indexed user, uint256 amount, uint256 nonce, string targetChain);
event TokensUnlocked(address indexed user, uint256 amount, uint256 nonce, string sourceChain);
event BridgePaused(bool paused);
event BridgeUnpaused(bool unpaused);
```

## 🌐 Network Configuration

### U2U Network
- **Chain ID**: 39
- **RPC**: https://rpc-mainnet.u2u.xyz
- **Explorer**: https://u2uscan.xyz/
- **Token**: 0xC345f186C6337b8df46B19c8ED026e9d64ab9F80

### Sepolia Network
- **Chain ID**: 11155111
- **RPC**: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- **Explorer**: https://sepolia.etherscan.io
- **Token**: 0xD5e91C9ADB874601E5980521A9665962EaB950FB

## 🔄 Bridge Flow

### U2U → Sepolia
1. User approves bridge to spend tokens
2. User calls `lockTokens()` on U2U bridge
3. Frontend switches to Sepolia network
4. Owner calls `unlockTokens()` on Sepolia bridge

### Sepolia → U2U
1. User approves bridge to spend tokens
2. User calls `lockTokens()` on Sepolia bridge
3. Frontend switches to U2U network
4. Owner calls `unlockTokens()` on U2U bridge

## 🧪 Testing

### Run Tests
```bash
npx hardhat test
```

### Manual Testing
1. Deploy contracts on both networks
2. Fund bridge contracts
3. Test bridging in both directions
4. Verify token balances

## 🛡️ Security Considerations

### Access Control
- Only contract owner can unlock tokens
- Nonce system prevents replay attacks
- Pausable for emergency situations

### Best Practices
- Never commit private keys
- Monitor bridge contracts regularly
- Keep contracts updated
- Use multi-sig for production

## 🚨 Emergency Procedures

### Pause Bridge
```solidity
bridge.pauseBridge();
```

### Emergency Withdraw
```solidity
bridge.emergencyWithdraw(amount);
```

### Transfer Ownership
```solidity
bridge.transferOwnership(newOwner);
```

## 📊 Monitoring

### Key Metrics
- Bridge contract balances
- Number of transactions
- Failed transactions
- Gas usage

### Events to Monitor
- `TokensLocked` events
- `TokensUnlocked` events
- `BridgePaused` events
- Failed transactions

## 🔧 Troubleshooting

### Common Issues

1. **Insufficient Balance**
   - Check bridge contract balance
   - Fund bridge if needed

2. **Network Issues**
   - Verify RPC URLs
   - Check network configurations

3. **Gas Issues**
   - Increase gas limit
   - Check gas prices

4. **Approval Issues**
   - Check token approval amounts
   - Verify allowance

### Debug Commands

```bash
# Check bridge balance
npx hardhat run scripts/check-bridge-balance.ts

# Verify contract deployment
npx hardhat run scripts/verify-deployment.ts

# Test bridge functionality
npx hardhat run scripts/test-bridge.ts
```

## 📈 Production Deployment

### Pre-deployment Checklist
- [ ] Test on testnets
- [ ] Security audit completed
- [ ] Emergency procedures documented
- [ ] Monitoring setup
- [ ] Multi-sig configuration

### Post-deployment
- [ ] Verify contract addresses
- [ ] Fund bridge contracts
- [ ] Test bridge functionality
- [ ] Monitor for issues
- [ ] Update documentation

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review contract events and logs
3. Verify network configurations
4. Contact development team

## 📄 License

MIT License - see LICENSE file for details.
