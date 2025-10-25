import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther, parseEther } from "ethers";

async function main() {
  console.log("🔄 Redeploying Bridge Contract with CELO Configuration\n");

  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";

  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", formatEther(await provider.getBalance(deployer.address)), "CELO\n");

  // Existing token address
  const tokenAddress = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";

  // Deploy new Bridge Contract with CELO configuration
  console.log("🔨 Deploying updated Bridge Contract...");
  const bridgeArtifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
  const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);
  const bridgeContract = await bridgeFactory.deploy(tokenAddress);
  await bridgeContract.deploymentTransaction()?.wait();
  const newBridgeAddress = await bridgeContract.getAddress();
  console.log("✅ Updated Bridge Contract deployed to:", newBridgeAddress);

  // Fund the new bridge with 100 BAZ tokens
  console.log("💰 Funding new bridge with 100 BAZ tokens...");
  const bazigrArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const bazigrFactory = new ContractFactory(bazigrArtifact.abi, bazigrArtifact.bytecode, deployer);
  const bazigrToken = bazigrFactory.attach(tokenAddress);
  
  const bazAmount = parseEther("100");
  const mintBridgeTx = await bazigrToken.mint(newBridgeAddress, bazAmount);
  await mintBridgeTx.wait();
  console.log("✅ New Bridge Contract funded with 100 BAZ tokens");
  console.log("   Transaction:", mintBridgeTx.hash);

  // Verify contract states
  console.log("\n🔍 Contract Verification:");
  console.log("New Bridge Contract BAZ Balance:", formatEther(await bazigrToken.balanceOf(newBridgeAddress)), "BAZ");
  console.log("Source Chain:", await bridgeContract.SOURCE_CHAIN());
  console.log("Target Chain:", await bridgeContract.TARGET_CHAIN());
  console.log("Owner:", await bridgeContract.owner());

  console.log("\n🎉 Bridge Contract Redeployment completed successfully!");
  console.log("\n📝 Updated Contract Information:");
  console.log("Network: Celo Sepolia (Chain ID: 11142220)");
  console.log("Bazigr Token:", tokenAddress);
  console.log("Swap Contract:", "0xfE053B49CE20845E6c492A575daCDD5ab7d3038D");
  console.log("Bridge Contract:", newBridgeAddress);
  console.log("Owner:", deployer.address);
  
  console.log("\n🔧 Frontend Configuration Update:");
  console.log("Update bridge-box.tsx with:");
  console.log(`const CELO_BRIDGE_ADDRESS = "${newBridgeAddress}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
