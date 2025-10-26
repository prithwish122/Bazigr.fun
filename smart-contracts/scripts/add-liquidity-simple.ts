import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";

/**
 * Simple script to add liquidity step by step
 */
async function main() {
  console.log("🚀 Adding Initial Liquidity to BAZ/WCELO Pool\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Account:", deployer.address, "\n");

  // Contract addresses
  const BAZ_TOKEN = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
  const WCELO = "0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF";
  const ROUTER = "0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1";

  // Load contracts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const routerArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Router.sol:UniswapV2Router");

  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wcelo = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);
  const router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, deployer).attach(ROUTER);

  // Check balances
  console.log("Current balances:");
  const bazBal = await bazToken.balanceOf(deployer.address);
  const wceloBal = await wcelo.balanceOf(deployer.address);
  console.log("  BAZ:  ", formatEther(bazBal));
  console.log("  WCELO:", formatEther(wceloBal), "\n");

  // Amounts to add
  const BAZ_AMOUNT = parseEther("500");  // 500 BAZ
  const WCELO_AMOUNT = parseEther("2.5"); // 2.5 WCELO (200:1 ratio)

  console.log("=" .repeat(60));
  console.log("Adding Liquidity:");
  console.log("  ", formatEther(BAZ_AMOUNT), "BAZ");
  console.log("  ", formatEther(WCELO_AMOUNT), "WCELO");
  console.log("  Ratio: 1 WCELO = 200 BAZ");
  console.log("=" .repeat(60), "\n");

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
    parseEther("400"), // Min 400 BAZ (20% slippage)
    parseEther("2"),   // Min 2 WCELO (20% slippage)
    deployer.address,
    deadline,
    {
      gasLimit: 500000 // Set gas limit
    }
  );
  
  console.log("  TX:", tx3.hash);
  const receipt = await tx3.wait();
  console.log("  ✅ Liquidity added!");
  console.log("  Gas used:", receipt.gasUsed.toString(), "\n");

  console.log("=" .repeat(60));
  console.log("✅ SUCCESS! Pool is now active!");
  console.log("=" .repeat(60));
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
