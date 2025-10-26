import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";

/**
 * Quick setup script - Add initial liquidity to bootstrap the DEX
 */
async function main() {
  console.log("🚀 Setting up initial liquidity for BAZ/WCELO pool\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Account:", deployer.address);
  console.log("💰 Balance:", formatEther(await provider.getBalance(deployer.address)), "CELO\n");

  // Contract addresses
  const BAZ_TOKEN = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
  const WCELO = "0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF";
  const ROUTER = "0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1";
  const MASTERCHEF = "0xd6f36ebA3775C25Da19D730A687Dc807b7912449";
  const BAZ_WCELO_PAIR = "0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14";

  // Load contracts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const routerArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Router.sol:UniswapV2Router");
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");
  const masterChefArtifact = await hre.artifacts.readArtifact("contracts/MasterChef.sol:MasterChef");

  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wcelo = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);
  const router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, deployer).attach(ROUTER);
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(BAZ_WCELO_PAIR);
  const masterChef = new ContractFactory(masterChefArtifact.abi, masterChefArtifact.bytecode, deployer).attach(MASTERCHEF);

  // Configuration
  const CELO_TO_WRAP = parseEther("5"); // 5 CELO
  const BAZ_LIQUIDITY = parseEther("1000"); // 1000 BAZ
  const CELO_LIQUIDITY = parseEther("5"); // 5 CELO worth of liquidity
  const REWARD_FUND = parseEther("100000"); // 100k BAZ for rewards

  console.log("📝 Step 1: Mint BAZ tokens...");
  const mintTx = await bazToken.mint(deployer.address, 100000); // Will be multiplied by 10**18
  await mintTx.wait();
  const bazBalance = await bazToken.balanceOf(deployer.address);
  console.log("✅ BAZ Balance:", formatEther(bazBalance), "BAZ\n");

  console.log("📝 Step 2: Wrap CELO...");
  const wrapTx = await wcelo.deposit({ value: CELO_TO_WRAP });
  await wrapTx.wait();
  const wceloBalance = await wcelo.balanceOf(deployer.address);
  console.log("✅ WCELO Balance:", formatEther(wceloBalance), "WCELO\n");

  console.log("📝 Step 3: Approve tokens for Router...");
  const approveBazTx = await bazToken.approve(ROUTER, BAZ_LIQUIDITY);
  await approveBazTx.wait();
  const approveWceloTx = await wcelo.approve(ROUTER, CELO_LIQUIDITY);
  await approveWceloTx.wait();
  console.log("✅ Tokens approved\n");

  console.log("📝 Step 4: Add initial liquidity...");
  console.log("   Adding:", formatEther(BAZ_LIQUIDITY), "BAZ");
  console.log("   Adding:", formatEther(CELO_LIQUIDITY), "WCELO");
  
  const deadline = Math.floor(Date.now() / 1000) + 1200;
  const addLiqTx = await router.addLiquidity(
    BAZ_TOKEN,
    WCELO,
    BAZ_LIQUIDITY,
    CELO_LIQUIDITY,
    0,
    0,
    deployer.address,
    deadline
  );
  await addLiqTx.wait();
  
  const lpBalance = await pair.balanceOf(deployer.address);
  console.log("✅ Liquidity added! LP tokens:", formatEther(lpBalance), "\n");

  console.log("📝 Step 5: Check pool reserves...");
  const reserves = await pair.getReserves();
  console.log("   Reserve 0:", formatEther(reserves[0]));
  console.log("   Reserve 1:", formatEther(reserves[1]));
  console.log("   Initial exchange rate: 1 CELO =", 
    (Number(formatEther(reserves[0])) / Number(formatEther(reserves[1]))).toFixed(2), "BAZ\n");

  console.log("📝 Step 6: Fund MasterChef with rewards...");
  const approveMasterChefTx = await bazToken.approve(MASTERCHEF, REWARD_FUND);
  await approveMasterChefTx.wait();
  const fundTx = await masterChef.fundRewards(REWARD_FUND);
  await fundTx.wait();
  const rewardBalance = await masterChef.getRewardBalance();
  console.log("✅ MasterChef funded with:", formatEther(rewardBalance), "BAZ");
  
  const bazPerBlock = parseEther("10");
  const blocksPerDay = 17280;
  const daysOfRewards = Number(rewardBalance) / Number(bazPerBlock) / blocksPerDay;
  console.log("   Rewards will last for:", daysOfRewards.toFixed(2), "days\n");

  console.log("=" .repeat(60));
  console.log("✅ SETUP COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📊 Summary:");
  console.log("  Pool Liquidity: ", formatEther(reserves[0]), "/", formatEther(reserves[1]));
  console.log("  LP Tokens:", formatEther(lpBalance));
  console.log("  MasterChef Rewards:", formatEther(rewardBalance), "BAZ");
  console.log("  Exchange Rate: 1 CELO =", 
    (Number(formatEther(reserves[0])) / Number(formatEther(reserves[1]))).toFixed(2), "BAZ");
  
  console.log("\n🎯 Users can now:");
  console.log("  ✅ Swap BAZ ↔ WCELO");
  console.log("  ✅ Add liquidity to earn fees");
  console.log("  ✅ Stake LP tokens to earn", formatEther(bazPerBlock), "BAZ per block");
  
  console.log("\n🚀 DeFi module is ready for use!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
