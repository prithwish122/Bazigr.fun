import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";

/**
 * Fund MasterChef with BAZ tokens for yield farming rewards
 */
async function main() {
  console.log("💰 Funding MasterChef with BAZ Rewards\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Account:", deployer.address);
  console.log("💰 Balance:", formatEther(await provider.getBalance(deployer.address)), "CELO\n");

  // Contract addresses
  const BAZ_TOKEN_ADDRESS = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
  const MASTERCHEF_ADDRESS = "0xd6f36ebA3775C25Da19D730A687Dc807b7912449";

  // Load contracts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const masterChefArtifact = await hre.artifacts.readArtifact("contracts/MasterChef.sol:MasterChef");

  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN_ADDRESS);
  const masterChef = new ContractFactory(masterChefArtifact.abi, masterChefArtifact.bytecode, deployer).attach(MASTERCHEF_ADDRESS);

  // Check current balance
  const currentRewards = await masterChef.getRewardBalance();
  console.log("📊 Current MasterChef reward balance:", formatEther(currentRewards), "BAZ\n");

  // Fund amount (e.g., 1,000,000 BAZ for rewards)
  const fundAmount = parseEther("1000000");
  console.log("💵 Funding amount:", formatEther(fundAmount), "BAZ");

  // Check if we have enough BAZ
  const bazBalance = await bazToken.balanceOf(deployer.address);
  console.log("💼 Your BAZ balance:", formatEther(bazBalance), "BAZ");

  if (bazBalance < fundAmount) {
    console.log("\n⚠️  Warning: Insufficient BAZ balance!");
    console.log("   Funding with available balance instead...");
  }

  const actualFundAmount = bazBalance < fundAmount ? bazBalance : fundAmount;

  // Approve BAZ tokens
  console.log("\n📝 Step 1: Approving BAZ tokens...");
  const approveTx = await bazToken.approve(MASTERCHEF_ADDRESS, actualFundAmount);
  await approveTx.wait();
  console.log("✅ Approved", formatEther(actualFundAmount), "BAZ");

  // Fund MasterChef
  console.log("\n📝 Step 2: Funding MasterChef...");
  const fundTx = await masterChef.fundRewards(actualFundAmount);
  await fundTx.wait();
  console.log("✅ Funded successfully!");

  // Check new balance
  const newRewards = await masterChef.getRewardBalance();
  console.log("\n📊 New MasterChef reward balance:", formatEther(newRewards), "BAZ");

  // Calculate how long rewards will last
  const bazPerBlock = parseEther("10");
  const blocksPerDay = 86400 / 5; // ~5 second blocks on Celo
  const daysOfRewards = Number(newRewards) / Number(bazPerBlock) / blocksPerDay;

  console.log("\n⏱️  Reward Duration:");
  console.log("   BAZ per block:", formatEther(bazPerBlock));
  console.log("   Blocks per day:", blocksPerDay.toFixed(0));
  console.log("   Days of rewards:", daysOfRewards.toFixed(2), "days");
  console.log("   Rewards per day:", (Number(formatEther(bazPerBlock)) * blocksPerDay).toFixed(2), "BAZ");

  console.log("\n✅ MasterChef funding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
