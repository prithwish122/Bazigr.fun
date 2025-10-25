# Bazigr Bridge Deployment Guide

This guide explains how to deploy and configure the Bazigr Bridge contracts for cross-chain token transfers between U2U and Sepolia networks.

## Prerequisites

1. **Environment Variables**: Create a `.env` file in the `smart-contracts` directory with:
   ```
   U2U_RPC_URL=https://rpc-mainnet.u2u.xyz
   U2U_PRIVATE_KEY=your_u2u_private_key
   SEPOLIA_PRIVATE_KEY=your_sepolia_private_key
   INFURA_API_KEY=your_infura_api_key
   ```

2. **Token Addresses**: Ensure you have the Bazigr token addresses on both networks:
   - U2U: `0xC345f186C6337b8df46B19c8ED026e9d64ab9F80`
   - Sepolia: `0xD5e91C9ADB874601E5980521A9665962EaB950FB`

## Deployment Steps

### 1. Deploy Bridge Contract on U2U Network

```bash
cd client/smart-contracts
npx hardhat run scripts/deploy-bridge-u2u.ts --network u2uMainnet
```

After deployment, update the `U2U_BRIDGE_ADDRESS` in the frontend.

### 2. Deploy Bridge Contract on Sepolia Network

```bash
npx hardhat run scripts/deploy-bridge-sepolia.ts --network sepolia
```

After deployment, update the `SEPOLIA_BRIDGE_ADDRESS` in the frontend.

### 3. Fund Bridge Contracts

Run the funding script to provide initial liquidity to both bridge contracts:

```bash
npx hardhat run scripts/fund-bridge.ts --network u2uMainnet
npx hardhat run scripts/fund-bridge.ts --network sepolia
```

### 4. Update Frontend Configuration

Update the contract addresses in `client/src/app/components/bridge/bridge-box.tsx`:

```typescript
const U2U_BRIDGE_ADDRESS = "0x..."; // Your deployed U2U bridge address
const SEPOLIA_BRIDGE_ADDRESS = "0x..."; // Your deployed Sepolia bridge address
```

## Bridge Contract Features

### Core Functions

1. **lockTokens(uint256 amount)**: Locks tokens on the source chain
2. **unlockTokens(address user, uint256 amount, uint256 nonce)**: Unlocks tokens on the target chain
3. **getUserNonce(address user)**: Gets the current nonce for a user
4. **getBridgeBalance()**: Gets the current balance of the bridge contract

### Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Allows emergency pausing of the bridge
- **Nonce System**: Prevents replay attacks
- **Owner Controls**: Only owner can unlock tokens

### Events

- `TokensLocked`: Emitted when tokens are locked on source chain
- `TokensUnlocked`: Emitted when tokens are unlocked on target chain
- `BridgePaused/BridgeUnpaused`: Emergency control events

## Frontend Integration

The bridge frontend automatically:

1. **Detects Network**: Checks if user is on correct network
2. **Handles Approvals**: Automatically approves token spending
3. **Manages Transactions**: Handles the complete bridge flow
4. **Network Switching**: Automatically switches between networks
5. **Error Handling**: Provides user-friendly error messages

## Bridge Flow

### U2U → Sepolia
1. User approves bridge to spend tokens
2. User locks tokens in U2U bridge
3. Frontend switches to Sepolia network
4. Bridge unlocks equivalent tokens on Sepolia

### Sepolia → U2U
1. User approves bridge to spend tokens
2. User locks tokens in Sepolia bridge
3. Frontend switches to U2U network
4. Bridge unlocks equivalent tokens on U2U

## Testing

### Manual Testing
1. Deploy contracts on both networks
2. Fund bridge contracts with initial tokens
3. Test bridging from U2U to Sepolia
4. Test bridging from Sepolia to U2U
5. Verify token balances on both networks

### Automated Testing
```bash
npx hardhat test
```

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure bridge contracts have enough tokens
2. **Network Issues**: Verify RPC URLs and network configurations
3. **Gas Issues**: Ensure sufficient gas for transactions
4. **Approval Issues**: Check token approval amounts

### Emergency Procedures

1. **Pause Bridge**: Use `pauseBridge()` function
2. **Emergency Withdraw**: Use `emergencyWithdraw()` function
3. **Transfer Ownership**: Use `transferOwnership()` function

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Access Control**: Ensure only authorized addresses can unlock tokens
3. **Monitoring**: Monitor bridge contracts for unusual activity
4. **Updates**: Keep contracts updated with latest security patches

## Network Configuration

### U2U Network
- Chain ID: 39
- RPC: https://rpc-mainnet.u2u.xyz
- Explorer: https://u2uscan.xyz/

### Sepolia Network
- Chain ID: 11155111
- RPC: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- Explorer: https://sepolia.etherscan.io

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review contract events and logs
3. Verify network configurations
4. Contact the development team
