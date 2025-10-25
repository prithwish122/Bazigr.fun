import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Bazigr Bridge Complete Deployment\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Token addresses
  const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const SEPOLIA_TOKEN_ADDRESS = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

  console.log("📋 Token Addresses:");
  console.log("U2U Token:", U2U_TOKEN_ADDRESS);
  console.log("Sepolia Token:", SEPOLIA_TOKEN_ADDRESS);
  console.log("");

  // Deploy bridge contract
  const BazigrBridge = await ethers.getContractFactory("BazigrBridge");
  
  console.log("🔨 Deploying BazigrBridge...");
  const bridge = await BazigrBridge.deploy(U2U_TOKEN_ADDRESS);
  await bridge.waitForDeployment();

  const bridgeAddress = await bridge.getAddress();
  console.log("✅ BazigrBridge deployed to:", bridgeAddress);
  console.log("   Owner:", await bridge.owner());
  console.log("   Token:", await bridge.bazigrToken());
  console.log("   Source Chain:", await bridge.SOURCE_CHAIN());
  console.log("   Target Chain:", await bridge.TARGET_CHAIN());
  console.log("   Bridge Balance:", ethers.formatEther(await bridge.getBridgeBalance()), "tokens");
  console.log("");

  // Get token contract for funding
  const BazigrToken = await ethers.getContractFactory("Bazigr");
  const token = BazigrToken.attach(U2U_TOKEN_ADDRESS);

  // Fund the bridge with initial tokens
  console.log("💰 Funding bridge with initial tokens...");
  const fundingAmount = ethers.parseEther("1000");
  
  try {
    const fundTx = await token.mint(bridgeAddress, fundingAmount);
    await fundTx.wait();
    console.log("✅ Bridge funded with", ethers.formatEther(fundingAmount), "tokens");
    console.log("   Transaction:", fundTx.hash);
  } catch (error) {
    console.log("⚠️  Could not fund bridge automatically. Please fund manually.");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next Steps:");
  console.log("1. Deploy the same contract to Sepolia network");
  console.log("2. Fund the Sepolia bridge contract");
  console.log("3. Update frontend with bridge addresses");
  console.log("4. Test the bridge functionality");
  
  console.log("\n🔧 Frontend Configuration:");
  console.log("Update bridge-box.tsx with:");
  console.log(`const U2U_BRIDGE_ADDRESS = "${bridgeAddress}";`);
  console.log("const SEPOLIA_BRIDGE_ADDRESS = \"<SEPOLIA_BRIDGE_ADDRESS>\";");
  
  console.log("\n📋 Contract Information:");
  console.log("Bridge Address:", bridgeAddress);
  console.log("Token Address:", U2U_TOKEN_ADDRESS);
  console.log("Owner:", await bridge.owner());
  console.log("Network:", await bridge.SOURCE_CHAIN(), "→", await bridge.TARGET_CHAIN());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
