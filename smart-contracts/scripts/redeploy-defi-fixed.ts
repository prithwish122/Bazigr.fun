import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";
import fs from "fs";

/**
 * Redeploy DeFi contracts with fixed Pair
 */
async function main() {
  console.log("🔄 Redeploying DeFi Contracts with Fixed Pair\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Deployer:", deployer.address);
  console.log("💰 Balance:", formatEther(await provider.getBalance(deployer.address)), "CELO\n");

  // Existing contracts
  const BAZ_TOKEN = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
  const WCELO = "0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF";
  const OLD_MASTERCHEF = "0xd6f36ebA3775C25Da19D730A687Dc807b7912449";

  console.log("Using existing tokens:");
  console.log("  BAZ:  ", BAZ_TOKEN);
  console.log("  WCELO:", WCELO);
  console.log("\n");

  // Deploy new Factory
  console.log("=" .repeat(70));
  console.log("STEP 1: Deploying Factory");
  console.log("=" .repeat(70));
  const factoryArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Factory.sol:UniswapV2Factory");
  const Factory = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, deployer);
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed:", factoryAddress, "\n");

  // Deploy new Router
  console.log("=" .repeat(70));
  console.log("STEP 2: Deploying Router");
  console.log("=" .repeat(70));
  const routerArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Router.sol:UniswapV2Router");
  const Router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, deployer);
  const router = await Router.deploy(factoryAddress, WCELO);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ Router deployed:", routerAddress, "\n");

  // Create BAZ/WCELO pair
  console.log("=" .repeat(70));
  console.log("STEP 3: Creating BAZ/WCELO Pair");
  console.log("=" .repeat(70));
  const createPairTx = await factory.createPair(BAZ_TOKEN, WCELO);
  await createPairTx.wait();
  const pairAddress = await factory.getPair(BAZ_TOKEN, WCELO);
  console.log("✅ Pair created:", pairAddress, "\n");

  // Deploy new MasterChef
  console.log("=" .repeat(70));
  console.log("STEP 4: Deploying MasterChef");
  console.log("=" .repeat(70));
  const bazPerBlock = parseEther("10");
  const currentBlock = await provider.getBlockNumber();
  const startBlock = currentBlock + 10;

  const masterChefArtifact = await hre.artifacts.readArtifact("contracts/MasterChef.sol:MasterChef");
  const MasterChef = new ContractFactory(masterChefArtifact.abi, masterChefArtifact.bytecode, deployer);
  const masterChef = await MasterChef.deploy(BAZ_TOKEN, bazPerBlock, startBlock);
  await masterChef.waitForDeployment();
  const masterChefAddress = await masterChef.getAddress();
  console.log("✅ MasterChef deployed:", masterChefAddress);
  console.log("   BAZ per block:", formatEther(bazPerBlock));
  console.log("   Start block:", startBlock, "\n");

  // Add pool to MasterChef
  console.log("=" .repeat(70));
  console.log("STEP 5: Adding Pool to MasterChef");
  console.log("=" .repeat(70));
  const addPoolTx = await masterChef.add(100, pairAddress, true);
  await addPoolTx.wait();
  console.log("✅ Pool added (BAZ/WCELO LP, 100 allocation points)\n");

  // Fund MasterChef
  console.log("=" .repeat(70));
  console.log("STEP 6: Funding MasterChef");
  console.log("=" .repeat(70));
  const fundAmount = parseEther("1000000");
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  
  const approveTx = await bazToken.approve(masterChefAddress, fundAmount);
  await approveTx.wait();
  console.log("✅ Approved", formatEther(fundAmount), "BAZ");

  const fundTx = await masterChef.fundRewards(fundAmount);
  await fundTx.wait();
  console.log("✅ Funded MasterChef with", formatEther(fundAmount), "BAZ\n");

  // Save deployment info
  const deployment = {
    network: "celo-sepolia",
    timestamp: new Date().toISOString(),
    contracts: {
      BAZ_TOKEN,
      WCELO,
      FACTORY: factoryAddress,
      ROUTER: routerAddress,
      MASTERCHEF: masterChefAddress,
      BAZ_WCELO_PAIR: pairAddress,
    },
    config: {
      BAZ_PER_BLOCK: "10",
      START_BLOCK: startBlock,
      INITIAL_FUNDING: "1000000",
    },
  };

  fs.writeFileSync(
    "deployment-defi-fixed.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("=" .repeat(70));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(70));
  console.log("\n📝 Contract Addresses:");
  console.log("   BAZ Token:    ", BAZ_TOKEN);
  console.log("   WCELO:        ", WCELO);
  console.log("   Factory:      ", factoryAddress);
  console.log("   Router:       ", routerAddress);
  console.log("   MasterChef:   ", masterChefAddress);
  console.log("   BAZ/WCELO Pair:", pairAddress);
  console.log("\n💾 Saved to: deployment-defi-fixed.json\n");

  console.log("⚠️  IMPORTANT: Update frontend config with new addresses!");
  console.log("   File: src/app/contract/defi-config.ts\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
