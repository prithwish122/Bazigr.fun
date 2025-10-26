import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther, parseEther } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🚀 Starting Bazigr DeFi Module Deployment on Celo Testnet\n");

  // Setup provider and deployer
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", formatEther(await provider.getBalance(deployer.address)), "CELO\n");

  // Existing BAZ token address
  const BAZ_TOKEN_ADDRESS = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
  console.log("✅ Using existing BAZ token at:", BAZ_TOKEN_ADDRESS, "\n");

  // Step 1: Deploy WCELO
  console.log("📝 Step 1: Deploying WCELO...");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const wceloFactory = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer);
  const wcelo = await wceloFactory.deploy();
  await wcelo.waitForDeployment();
  const wceloAddress = await wcelo.getAddress();
  console.log("✅ WCELO deployed to:", wceloAddress, "\n");

  // Step 2: Deploy Uniswap V2 Factory
  console.log("📝 Step 2: Deploying Uniswap V2 Factory...");
  const factoryArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Factory.sol:UniswapV2Factory");
  const factoryFactory = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, deployer);
  const factory = await factoryFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed to:", factoryAddress, "\n");

  // Step 3: Deploy Uniswap V2 Router
  console.log("📝 Step 3: Deploying Uniswap V2 Router...");
  const routerArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Router.sol:UniswapV2Router");
  const routerFactory = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, deployer);
  const router = await routerFactory.deploy(factoryAddress, wceloAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ Router deployed to:", routerAddress, "\n");

  // Step 4: Deploy MasterChef
  console.log("📝 Step 4: Deploying MasterChef...");
  const currentBlock = await provider.getBlockNumber();
  const startBlock = currentBlock + 10; // Start farming in 10 blocks
  const bazPerBlock = parseEther("10"); // 10 BAZ per block

  const masterChefArtifact = await hre.artifacts.readArtifact("contracts/MasterChef.sol:MasterChef");
  const masterChefFactory = new ContractFactory(masterChefArtifact.abi, masterChefArtifact.bytecode, deployer);
  const masterChef = await masterChefFactory.deploy(
    BAZ_TOKEN_ADDRESS,
    bazPerBlock,
    startBlock
  );
  await masterChef.waitForDeployment();
  const masterChefAddress = await masterChef.getAddress();
  console.log("✅ MasterChef deployed to:", masterChefAddress);
  console.log("   BAZ per block:", formatEther(bazPerBlock));
  console.log("   Start block:", startBlock, "\n");

  // Step 5: Create liquidity pair (BAZ/WCELO)
  console.log("📝 Step 5: Creating BAZ/WCELO liquidity pair...");
  const createPairTx = await factory.createPair(BAZ_TOKEN_ADDRESS, wceloAddress);
  await createPairTx.wait();
  const bazWceloPair = await factory.getPair(BAZ_TOKEN_ADDRESS, wceloAddress);
  console.log("✅ BAZ/WCELO pair:", bazWceloPair, "\n");

  // Step 6: Add pool to MasterChef
  console.log("📝 Step 6: Adding BAZ/WCELO LP pool to MasterChef...");
  const addPoolTx = await masterChef.add(100, bazWceloPair, false);
  await addPoolTx.wait();
  console.log("✅ Pool 0: BAZ/WCELO (100 allocation points)\n");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📋 Contract Addresses:\n");
  console.log("BAZ Token (existing):     ", BAZ_TOKEN_ADDRESS);
  console.log("WCELO:                    ", wceloAddress);
  console.log("Uniswap V2 Factory:       ", factoryAddress);
  console.log("Uniswap V2 Router:        ", routerAddress);
  console.log("MasterChef:               ", masterChefAddress);
  console.log("\n🔗 Liquidity Pairs:\n");
  console.log("BAZ/WCELO:                ", bazWceloPair);
  console.log("\n💎 MasterChef Pools:\n");
  console.log("Pool 0: BAZ/WCELO (100 allocation points)");
  console.log("\n⚙️  Configuration:\n");
  console.log("BAZ per block:            ", formatEther(bazPerBlock), "BAZ");
  console.log("Farming starts at block:  ", startBlock);
  console.log("\n⚠️  IMPORTANT: Fund MasterChef with BAZ tokens for rewards!");
  console.log("   Run: await bazToken.transfer(masterChefAddress, amount)");
  console.log("=" .repeat(60));

  // Save deployment info to file
  const deploymentInfo = {
    network: "celo-sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      bazToken: BAZ_TOKEN_ADDRESS,
      wcelo: wceloAddress,
      factory: factoryAddress,
      router: routerAddress,
      masterChef: masterChefAddress,
    },
    pairs: {
      bazWcelo: bazWceloPair,
    },
    pools: [
      { id: 0, name: "BAZ/WCELO", allocPoint: 100 },
    ],
    config: {
      bazPerBlock: formatEther(bazPerBlock),
      startBlock: startBlock,
    },
  };

  console.log("\n📄 Deployment info saved to deployment-defi.json");
  
  const fs = await import("fs");
  fs.writeFileSync(
    "deployment-defi.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
