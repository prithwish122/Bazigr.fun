import hre from "hardhat";
import "dotenv/config";

async function main() {
  console.log("🚀 Deploying Complete Sepolia Setup...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Step 1: Deploy Bazigr Token on Sepolia
  console.log("🪙 Deploying Bazigr Token on Sepolia...");
  const BazigrToken = await hre.ethers.getContractFactory("Bazigr");
  const token = await BazigrToken.deploy();
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log("✅ Bazigr Token deployed to:", tokenAddress);
  
  // Mint initial tokens to deployer
  const mintAmount = hre.ethers.parseEther("10000"); // 10,000 tokens
  await token.mint(deployer.address, mintAmount);
  console.log("✅ Minted 10,000 BAZ tokens to deployer");

  // Step 2: Deploy Bridge Contract on Sepolia
  console.log("\n🌉 Deploying Bridge Contract on Sepolia...");
  const BazigrBridge = await hre.ethers.getContractFactory("BazigrBridge");
  const bridge = await BazigrBridge.deploy(tokenAddress);
  await bridge.waitForDeployment();
  
  const bridgeAddress = await bridge.getAddress();
  console.log("✅ Bridge deployed to:", bridgeAddress);

  // Step 3: Fund the bridge with tokens
  console.log("\n💰 Funding Bridge Contract...");
  const fundAmount = hre.ethers.parseEther("5000"); // 5,000 tokens
  await token.transfer(bridgeAddress, fundAmount);
  console.log("✅ Funded bridge with 5,000 BAZ tokens");

  // Step 4: Verify deployment
  console.log("\n🔍 Verifying Deployment...");
  const bridgeBalance = await bridge.getBridgeBalance();
  const bridgeOwner = await bridge.owner();
  const bridgeToken = await bridge.bazigrToken();
  const sourceChain = await bridge.SOURCE_CHAIN();
  const targetChain = await bridge.TARGET_CHAIN();
  const paused = await bridge.paused();

  console.log("✅ Verification Complete:");
  console.log("   Bridge Address:", bridgeAddress);
  console.log("   Token Address:", tokenAddress);
  console.log("   Owner:", bridgeOwner);
  console.log("   Token Contract:", bridgeToken);
  console.log("   Source Chain:", sourceChain);
  console.log("   Target Chain:", targetChain);
  console.log("   Bridge Balance:", hre.ethers.formatEther(bridgeBalance), "BAZ");
  console.log("   Paused:", paused);

  // Step 5: Update frontend configuration
  console.log("\n📝 Frontend Configuration:");
  console.log("Update these addresses in client/src/app/components/bridge/bridge-box.tsx:");
  console.log(`const SEPOLIA_BRIDGE_ADDRESS = "${bridgeAddress}";`);
  console.log(`const SEPOLIA_TOKEN_ADDRESS = "${tokenAddress}";`);

  console.log("\n🎉 Sepolia deployment completed successfully!");
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend with new contract addresses");
  console.log("2. Test bridge functionality");
  console.log("3. Verify token transfers");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
