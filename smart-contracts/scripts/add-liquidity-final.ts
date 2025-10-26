import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";
import fs from "fs";

/**
 * Add initial liquidity to the fixed BAZ/WCELO pool
 */
async function main() {
  console.log("🚀 Adding Initial Liquidity to Fixed BAZ/WCELO Pool\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Account:", deployer.address);
  console.log("💰 Balance:", formatEther(await provider.getBalance(deployer.address)), "CELO\n");

  // Load deployment
  const deployment = JSON.parse(fs.readFileSync("deployment-defi-fixed.json", "utf8"));
  const { BAZ_TOKEN, WCELO, ROUTER, BAZ_WCELO_PAIR } = deployment.contracts;

  console.log("Using contracts:");
  console.log("  BAZ:  ", BAZ_TOKEN);
  console.log("  WCELO:", WCELO);
  console.log("  Router:", ROUTER);
  console.log("  Pair:  ", BAZ_WCELO_PAIR);
  console.log("\n");

  // Load contracts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const routerArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Router.sol:UniswapV2Router");

  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wcelo = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);
  const router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, deployer).attach(ROUTER);

  // Check balances
  const bazBal = await bazToken.balanceOf(deployer.address);
  const wceloBal = await wcelo.balanceOf(deployer.address);
  console.log("Current balances:");
  console.log("  BAZ:  ", formatEther(bazBal));
  console.log("  WCELO:", formatEther(wceloBal));
  console.log("\n");

  // Amounts to add
  const BAZ_AMOUNT = parseEther("1000");  // 1000 BAZ
  const WCELO_AMOUNT = parseEther("5");   // 5 WCELO (200:1 ratio)

  console.log("=" .repeat(70));
  console.log("ADDING LIQUIDITY");
  console.log("  ", formatEther(BAZ_AMOUNT), "BAZ");
  console.log("  ", formatEther(WCELO_AMOUNT), "WCELO");
  console.log("  Ratio: 1 WCELO = 200 BAZ");
  console.log("=" .repeat(70));
  console.log("\n");

  // Step 1: Approve BAZ
  console.log("Step 1: Approving BAZ...");
  const tx1 = await bazToken.approve(ROUTER, BAZ_AMOUNT);
  console.log("  TX:", tx1.hash);
  await tx1.wait();
  console.log("  ✅ Approved\n");

  // Step 2: Approve WCELO
  console.log("Step 2: Approving WCELO...");
  const tx2 = await wcelo.approve(ROUTER, WCELO_AMOUNT);
  console.log("  TX:", tx2.hash);
  await tx2.wait();
  console.log("  ✅ Approved\n");

  // Step 3: Add liquidity
  console.log("Step 3: Adding liquidity...");
  const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
  
  const tx3 = await router.addLiquidity(
    BAZ_TOKEN,
    WCELO,
    BAZ_AMOUNT,
    WCELO_AMOUNT,
    parseEther("800"), // Min 800 BAZ (20% slippage)
    parseEther("4"),   // Min 4 WCELO (20% slippage)
    deployer.address,
    deadline,
    {
      gasLimit: 500000
    }
  );
  
  console.log("  TX:", tx3.hash);
  const receipt = await tx3.wait();
  console.log("  ✅ Liquidity added!");
  console.log("  Gas used:", receipt.gasUsed.toString());
  console.log("\n");

  // Check pair balances
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(BAZ_WCELO_PAIR);

  const reserves = await pair.getReserves();
  const totalSupply = await pair.totalSupply();
  const lpBalance = await pair.balanceOf(deployer.address);

  const token0 = await pair.token0();
  const isBazToken0 = token0.toLowerCase() === BAZ_TOKEN.toLowerCase();

  console.log("=" .repeat(70));
  console.log("POOL STATUS");
  console.log("=" .repeat(70));
  console.log("\nReserves:");
  console.log("  BAZ:  ", formatEther(isBazToken0 ? reserves[0] : reserves[1]));
  console.log("  WCELO:", formatEther(isBazToken0 ? reserves[1] : reserves[0]));
  console.log("\nLP Tokens:");
  console.log("  Total Supply:", formatEther(totalSupply));
  console.log("  Your Balance:", formatEther(lpBalance));
  console.log("\n");

  console.log("=" .repeat(70));
  console.log("✅ SUCCESS! Pool is now active and ready for trading!");
  console.log("=" .repeat(70));
  console.log("\nNext steps:");
  console.log("1. Open the frontend at http://localhost:3000/dashboard/pools");
  console.log("2. Connect your wallet");
  console.log("3. Try swapping, adding more liquidity, or staking!");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    if (error.data) {
      console.error("Data:", error.data);
    }
    process.exit(1);
  });
