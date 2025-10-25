import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther, parseEther } from "ethers";

async function main() {
  console.log("🚀 Bazigr Celo Sepolia Complete Deployment\n");

  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";

  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", formatEther(await provider.getBalance(deployer.address)), "CELO\n");

  // Deploy Bazigr Token
  console.log("🔨 Deploying Bazigr Token...");
  const bazigrArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const bazigrFactory = new ContractFactory(bazigrArtifact.abi, bazigrArtifact.bytecode, deployer);
  const bazigrToken = await bazigrFactory.deploy();
  await bazigrToken.deploymentTransaction()?.wait();
  const tokenAddress = await bazigrToken.getAddress();
  console.log("✅ Bazigr Token deployed to:", tokenAddress);

  // Deploy Swap Contract
  console.log("🔨 Deploying Swap Contract...");
  const swapArtifact = await hre.artifacts.readArtifact("contracts/Swap.sol:FixedRateSwap");
  const swapFactory = new ContractFactory(swapArtifact.abi, swapArtifact.bytecode, deployer);
  const swapContract = await swapFactory.deploy(tokenAddress, deployer.address);
  await swapContract.deploymentTransaction()?.wait();
  const swapAddress = await swapContract.getAddress();
  console.log("✅ Swap Contract deployed to:", swapAddress);

  // Deploy Bridge Contract
  console.log("🔨 Deploying Bridge Contract...");
  const bridgeArtifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
  const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);
  const bridgeContract = await bridgeFactory.deploy(tokenAddress);
  await bridgeContract.deploymentTransaction()?.wait();
  const bridgeAddress = await bridgeContract.getAddress();
  console.log("✅ Bridge Contract deployed to:", bridgeAddress);

  console.log("\n📋 Contract Addresses:");
  console.log("Bazigr Token:", tokenAddress);
  console.log("Swap Contract:", swapAddress);
  console.log("Bridge Contract:", bridgeAddress);

  // Fund Swap Contract with 5 CELO
  console.log("\n💰 Funding Swap Contract with 5 CELO...");
  const celoAmount = parseEther("5");
  const fundSwapTx = await deployer.sendTransaction({
    to: swapAddress,
    value: celoAmount
  });
  await fundSwapTx.wait();
  console.log("✅ Swap Contract funded with 5 CELO");
  console.log("   Transaction:", fundSwapTx.hash);

  // Mint 100 BAZ tokens to Swap Contract
  console.log("💰 Minting 100 BAZ tokens to Swap Contract...");
  const bazAmount = parseEther("100");
  const mintSwapTx = await bazigrToken.mint(swapAddress, bazAmount);
  await mintSwapTx.wait();
  console.log("✅ Swap Contract funded with 100 BAZ tokens");
  console.log("   Transaction:", mintSwapTx.hash);

  // Mint 100 BAZ tokens to Bridge Contract
  console.log("💰 Minting 100 BAZ tokens to Bridge Contract...");
  const mintBridgeTx = await bazigrToken.mint(bridgeAddress, bazAmount);
  await mintBridgeTx.wait();
  console.log("✅ Bridge Contract funded with 100 BAZ tokens");
  console.log("   Transaction:", mintBridgeTx.hash);

  // Verify contract states
  console.log("\n🔍 Contract Verification:");
  console.log("Swap Contract CELO Balance:", formatEther(await provider.getBalance(swapAddress)), "CELO");
  console.log("Swap Contract BAZ Balance:", formatEther(await bazigrToken.balanceOf(swapAddress)), "BAZ");
  console.log("Bridge Contract BAZ Balance:", formatEther(await bazigrToken.balanceOf(bridgeAddress)), "BAZ");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Contract Information:");
  console.log("Network: Celo Sepolia (Chain ID: 11142220)");
  console.log("Bazigr Token:", tokenAddress);
  console.log("Swap Contract:", swapAddress);
  console.log("Bridge Contract:", bridgeAddress);
  console.log("Owner:", deployer.address);
  
  console.log("\n🔧 Frontend Configuration:");
  console.log("Update contract addresses in frontend:");
  console.log(`CELO_TOKEN_ADDRESS = "${tokenAddress}";`);
  console.log(`CELO_SWAP_ADDRESS = "${swapAddress}";`);
  console.log(`CELO_BRIDGE_ADDRESS = "${bridgeAddress}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });