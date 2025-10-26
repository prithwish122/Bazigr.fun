import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";

/**
 * Check DeFi module status
 */
async function main() {
  console.log("📊 Checking Bazigr DeFi Module Status\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Account:", deployer.address);
  console.log("💰 CELO Balance:", formatEther(await provider.getBalance(deployer.address)), "\n");

  // Contract addresses
  const BAZ_TOKEN = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
  const WCELO = "0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF";
  const FACTORY = "0xf29E685888FbF4f5AADbA8a3dF2499EfF6BFfE1C";
  const ROUTER = "0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1";
  const MASTERCHEF = "0xd6f36ebA3775C25Da19D730A687Dc807b7912449";
  const BAZ_WCELO_PAIR = "0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14";

  // Load contracts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");
  const masterChefArtifact = await hre.artifacts.readArtifact("contracts/MasterChef.sol:MasterChef");

  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wcelo = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(BAZ_WCELO_PAIR);
  const masterChef = new ContractFactory(masterChefArtifact.abi, masterChefArtifact.bytecode, deployer).attach(MASTERCHEF);

  console.log("=" .repeat(60));
  console.log("📋 DEPLOYED CONTRACTS");
  console.log("=" .repeat(60));
  console.log("BAZ Token:         ", BAZ_TOKEN);
  console.log("WCELO:             ", WCELO);
  console.log("Factory:           ", FACTORY);
  console.log("Router:            ", ROUTER);
  console.log("MasterChef:        ", MASTERCHEF);
  console.log("BAZ/WCELO Pair:    ", BAZ_WCELO_PAIR);
  
  console.log("\n" + "=" .repeat(60));
  console.log("💼 YOUR BALANCES");
  console.log("=" .repeat(60));
  
  const bazBalance = await bazToken.balanceOf(deployer.address);
  const wceloBalance = await wcelo.balanceOf(deployer.address);
  const lpBalance = await pair.balanceOf(deployer.address);
  
  console.log("BAZ:               ", formatEther(bazBalance));
  console.log("WCELO:             ", formatEther(wceloBalance));
  console.log("LP Tokens:         ", formatEther(lpBalance));
  
  console.log("\n" + "=" .repeat(60));
  console.log("🏊 LIQUIDITY POOL STATUS");
  console.log("=" .repeat(60));
  
  const reserves = await pair.getReserves();
  const totalSupply = await pair.totalSupply();
  
  console.log("Reserve 0 (BAZ):   ", formatEther(reserves[0]));
  console.log("Reserve 1 (WCELO): ", formatEther(reserves[1]));
  console.log("Total LP Supply:   ", formatEther(totalSupply));
  
  if (Number(formatEther(reserves[0])) > 0 && Number(formatEther(reserves[1])) > 0) {
    const rate = Number(formatEther(reserves[0])) / Number(formatEther(reserves[1]));
    console.log("Exchange Rate:      1 CELO = ", rate.toFixed(2), "BAZ");
    console.log("Status:            ✅ ACTIVE");
  } else {
    console.log("Status:            ⚠️  NO LIQUIDITY");
  }
  
  console.log("\n" + "=" .repeat(60));
  console.log("🌾 MASTERCHEF STATUS");
  console.log("=" .repeat(60));
  
  const rewardBalance = await masterChef.getRewardBalance();
  const userStaked = await masterChef.getUserStaked(0, deployer.address);
  const poolTotalStaked = await masterChef.getPoolTotalStaked(0);
  const pendingRewards = await masterChef.pendingBAZ(0, deployer.address);
  
  console.log("Reward Balance:    ", formatEther(rewardBalance), "BAZ");
  console.log("Your Staked:       ", formatEther(userStaked), "LP");
  console.log("Pool Total Staked: ", formatEther(poolTotalStaked), "LP");
  console.log("Pending Rewards:   ", formatEther(pendingRewards), "BAZ");
  
  if (Number(formatEther(rewardBalance)) > 0) {
    console.log("Status:            ✅ FUNDED");
  } else {
    console.log("Status:            ⚠️  NEEDS FUNDING");
  }
  
  console.log("\n" + "=" .repeat(60));
  console.log("🎯 NEXT STEPS");
  console.log("=" .repeat(60));
  
  if (Number(formatEther(reserves[0])) === 0) {
    console.log("1. ⚠️  Add initial liquidity to BAZ/WCELO pool");
  } else {
    console.log("1. ✅ Pool has liquidity");
  }
  
  if (Number(formatEther(rewardBalance)) === 0) {
    console.log("2. ⚠️  Fund MasterChef with BAZ tokens");
  } else {
    console.log("2. ✅ MasterChef is funded");
  }
  
  if (Number(formatEther(userStaked)) === 0) {
    console.log("3. 📝 Stake LP tokens to test farming");
  } else {
    console.log("3. ✅ You have staked LP tokens");
  }
  
  console.log("\n✨ DeFi Module Status: ", 
    Number(formatEther(reserves[0])) > 0 && Number(formatEther(rewardBalance)) > 0 
      ? "✅ FULLY OPERATIONAL" 
      : "⚠️  SETUP REQUIRED");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
