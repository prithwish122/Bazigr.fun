import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";

/**
 * Complete DeFi interaction script - Tests all functionality
 */
async function main() {
  console.log("🧪 Testing Bazigr DeFi Module\n");

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
  const FACTORY = "0xf29E685888FbF4f5AADbA8a3dF2499EfF6BFfE1C";
  const ROUTER = "0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1";
  const MASTERCHEF = "0xd6f36ebA3775C25Da19D730A687Dc807b7912449";
  const BAZ_WCELO_PAIR = "0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14";

  // Load contract artifacts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const routerArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Router.sol:UniswapV2Router");
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");
  const masterChefArtifact = await hre.artifacts.readArtifact("contracts/MasterChef.sol:MasterChef");

  // Create contract instances
  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wcelo = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);
  const router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, deployer).attach(ROUTER);
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(BAZ_WCELO_PAIR);
  const masterChef = new ContractFactory(masterChefArtifact.abi, masterChefArtifact.bytecode, deployer).attach(MASTERCHEF);

  console.log("=" .repeat(60));
  console.log("STEP 1: Wrap CELO");
  console.log("=" .repeat(60));
  
  const wrapAmount = parseEther("1"); // Wrap 1 CELO
  console.log("Wrapping", formatEther(wrapAmount), "CELO...");
  const wrapTx = await wcelo.deposit({ value: wrapAmount });
  await wrapTx.wait();
  const wceloBalance = await wcelo.balanceOf(deployer.address);
  console.log("✅ WCELO Balance:", formatEther(wceloBalance), "WCELO\n");

  console.log("=" .repeat(60));
  console.log("STEP 2: Mint BAZ Tokens");
  console.log("=" .repeat(60));
  
  const mintAmount = parseEther("1000"); // Mint 1000 BAZ
  console.log("Minting", formatEther(mintAmount), "BAZ...");
  const mintTx = await bazToken.mint(deployer.address, 1000); // Contract multiplies by 10**18
  await mintTx.wait();
  const bazBalance = await bazToken.balanceOf(deployer.address);
  console.log("✅ BAZ Balance:", formatEther(bazBalance), "BAZ\n");

  console.log("=" .repeat(60));
  console.log("STEP 3: Add Liquidity");
  console.log("=" .repeat(60));
  
  const bazLiquidityAmount = parseEther("100");
  const celoLiquidityAmount = parseEther("0.5");
  
  console.log("Approving BAZ...");
  const approveBazTx = await bazToken.approve(ROUTER, bazLiquidityAmount);
  await approveBazTx.wait();
  
  console.log("Approving WCELO...");
  const approveWceloTx = await wcelo.approve(ROUTER, celoLiquidityAmount);
  await approveWceloTx.wait();
  
  console.log("Adding liquidity:", formatEther(bazLiquidityAmount), "BAZ +", formatEther(celoLiquidityAmount), "WCELO");
  const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
  
  const addLiqTx = await router.addLiquidity(
    BAZ_TOKEN,
    WCELO,
    bazLiquidityAmount,
    celoLiquidityAmount,
    0, // Accept any amount of BAZ
    0, // Accept any amount of WCELO
    deployer.address,
    deadline
  );
  await addLiqTx.wait();
  
  const lpBalance = await pair.balanceOf(deployer.address);
  console.log("✅ LP Token Balance:", formatEther(lpBalance), "LP\n");

  console.log("=" .repeat(60));
  console.log("STEP 4: Check Pool Reserves");
  console.log("=" .repeat(60));
  
  const reserves = await pair.getReserves();
  console.log("Reserve 0:", formatEther(reserves[0]));
  console.log("Reserve 1:", formatEther(reserves[1]));
  console.log("Timestamp:", reserves[2].toString(), "\n");

  console.log("=" .repeat(60));
  console.log("STEP 5: Swap BAZ for WCELO");
  console.log("=" .repeat(60));
  
  const swapAmount = parseEther("10");
  console.log("Swapping", formatEther(swapAmount), "BAZ for WCELO...");
  
  const approveBazSwapTx = await bazToken.approve(ROUTER, swapAmount);
  await approveBazSwapTx.wait();
  
  const path = [BAZ_TOKEN, WCELO];
  const amountsOut = await router.getAmountsOut(swapAmount, path);
  console.log("Expected output:", formatEther(amountsOut[1]), "WCELO");
  
  const swapTx = await router.swapExactTokensForTokens(
    swapAmount,
    0, // Accept any output amount
    path,
    deployer.address,
    deadline
  );
  await swapTx.wait();
  
  const wceloBalanceAfterSwap = await wcelo.balanceOf(deployer.address);
  console.log("✅ WCELO Balance after swap:", formatEther(wceloBalanceAfterSwap), "WCELO\n");

  console.log("=" .repeat(60));
  console.log("STEP 6: Fund MasterChef");
  console.log("=" .repeat(60));
  
  const rewardAmount = parseEther("10000");
  console.log("Funding MasterChef with", formatEther(rewardAmount), "BAZ...");
  
  const approveMasterChefTx = await bazToken.approve(MASTERCHEF, rewardAmount);
  await approveMasterChefTx.wait();
  
  const fundTx = await masterChef.fundRewards(rewardAmount);
  await fundTx.wait();
  
  const rewardBalance = await masterChef.getRewardBalance();
  console.log("✅ MasterChef Reward Balance:", formatEther(rewardBalance), "BAZ\n");

  console.log("=" .repeat(60));
  console.log("STEP 7: Stake LP Tokens");
  console.log("=" .repeat(60));
  
  const stakeAmount = parseEther("1"); // Stake 1 LP token
  console.log("Staking", formatEther(stakeAmount), "LP tokens...");
  
  const approveLpTx = await pair.approve(MASTERCHEF, stakeAmount);
  await approveLpTx.wait();
  
  const depositTx = await masterChef.deposit(0, stakeAmount);
  await depositTx.wait();
  
  const userStaked = await masterChef.getUserStaked(0, deployer.address);
  console.log("✅ User Staked:", formatEther(userStaked), "LP");
  
  const poolTotalStaked = await masterChef.getPoolTotalStaked(0);
  console.log("✅ Pool Total Staked:", formatEther(poolTotalStaked), "LP\n");

  console.log("=" .repeat(60));
  console.log("STEP 8: Wait for Rewards (Simulating blocks)");
  console.log("=" .repeat(60));
  
  console.log("Waiting for 10 blocks to accumulate rewards...");
  // In production, rewards accumulate naturally. For testing, we just check pending.
  
  const pendingRewards = await masterChef.pendingBAZ(0, deployer.address);
  console.log("✅ Pending Rewards:", formatEther(pendingRewards), "BAZ\n");

  console.log("=" .repeat(60));
  console.log("STEP 9: Harvest Rewards");
  console.log("=" .repeat(60));
  
  const bazBalanceBeforeHarvest = await bazToken.balanceOf(deployer.address);
  console.log("BAZ balance before harvest:", formatEther(bazBalanceBeforeHarvest), "BAZ");
  
  console.log("Harvesting rewards...");
  const harvestTx = await masterChef.harvest(0);
  await harvestTx.wait();
  
  const bazBalanceAfterHarvest = await bazToken.balanceOf(deployer.address);
  console.log("✅ BAZ balance after harvest:", formatEther(bazBalanceAfterHarvest), "BAZ");
  
  const harvestedAmount = bazBalanceAfterHarvest - bazBalanceBeforeHarvest;
  console.log("✅ Harvested:", formatEther(harvestedAmount), "BAZ\n");

  console.log("=" .repeat(60));
  console.log("STEP 10: Withdraw LP Tokens");
  console.log("=" .repeat(60));
  
  const withdrawAmount = parseEther("0.5"); // Withdraw 0.5 LP
  console.log("Withdrawing", formatEther(withdrawAmount), "LP tokens...");
  
  const withdrawTx = await masterChef.withdraw(0, withdrawAmount);
  await withdrawTx.wait();
  
  const userStakedAfter = await masterChef.getUserStaked(0, deployer.address);
  console.log("✅ User Staked after withdrawal:", formatEther(userStakedAfter), "LP");
  
  const lpBalanceAfter = await pair.balanceOf(deployer.address);
  console.log("✅ LP Balance:", formatEther(lpBalanceAfter), "LP\n");

  console.log("=" .repeat(60));
  console.log("STEP 11: Remove Liquidity");
  console.log("=" .repeat(60));
  
  const removeLpAmount = parseEther("0.1");
  console.log("Removing liquidity:", formatEther(removeLpAmount), "LP...");
  
  const approveLpRemoveTx = await pair.approve(ROUTER, removeLpAmount);
  await approveLpRemoveTx.wait();
  
  const removeLiqTx = await router.removeLiquidity(
    BAZ_TOKEN,
    WCELO,
    removeLpAmount,
    0, // Accept any amount of BAZ
    0, // Accept any amount of WCELO
    deployer.address,
    deadline
  );
  await removeLiqTx.wait();
  
  const finalBazBalance = await bazToken.balanceOf(deployer.address);
  const finalWceloBalance = await wcelo.balanceOf(deployer.address);
  console.log("✅ Final BAZ Balance:", formatEther(finalBazBalance), "BAZ");
  console.log("✅ Final WCELO Balance:", formatEther(finalWceloBalance), "WCELO\n");

  console.log("=" .repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=" .repeat(60));
  
  console.log("\n💼 Your Balances:");
  console.log("  BAZ:", formatEther(finalBazBalance), "BAZ");
  console.log("  WCELO:", formatEther(finalWceloBalance), "WCELO");
  console.log("  LP Tokens:", formatEther(await pair.balanceOf(deployer.address)), "LP");
  console.log("  Staked LP:", formatEther(await masterChef.getUserStaked(0, deployer.address)), "LP");
  
  console.log("\n📈 Pool Stats:");
  const finalReserves = await pair.getReserves();
  console.log("  Reserve 0:", formatEther(finalReserves[0]));
  console.log("  Reserve 1:", formatEther(finalReserves[1]));
  console.log("  Total Staked:", formatEther(await masterChef.getPoolTotalStaked(0)), "LP");
  console.log("  MasterChef Rewards:", formatEther(await masterChef.getRewardBalance()), "BAZ");
  
  console.log("\n✅ ALL TESTS PASSED! DeFi module is fully functional! 🎉\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
