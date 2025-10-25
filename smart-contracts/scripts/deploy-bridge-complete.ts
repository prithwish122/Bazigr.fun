import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Bazigr Bridge Deployment...\n");

  // Get the contract factory
  const BazigrBridge = await ethers.getContractFactory("BazigrBridge");

  // Token addresses
  const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const SEPOLIA_TOKEN_ADDRESS = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

  console.log("📋 Configuration:");
  console.log("U2U Token Address:", U2U_TOKEN_ADDRESS);
  console.log("Sepolia Token Address:", SEPOLIA_TOKEN_ADDRESS);
  console.log("");

  // Deploy to U2U Mainnet
  console.log("🌐 Deploying to U2U Mainnet...");
  try {
    const u2uBridge = await BazigrBridge.deploy(U2U_TOKEN_ADDRESS);
    await u2uBridge.waitForDeployment();
    const u2uBridgeAddress = await u2uBridge.getAddress();
    
    console.log("✅ U2U Bridge deployed at:", u2uBridgeAddress);
    console.log("   Owner:", await u2uBridge.owner());
    console.log("   Source Chain:", await u2uBridge.SOURCE_CHAIN());
    console.log("   Target Chain:", await u2uBridge.TARGET_CHAIN());
    console.log("   Bridge Balance:", ethers.formatEther(await u2uBridge.getBridgeBalance()), "tokens");
    console.log("");
  } catch (error) {
    console.error("❌ U2U deployment failed:", error);
  }

  // Deploy to Sepolia
  console.log("🌐 Deploying to Sepolia...");
  try {
    const sepoliaBridge = await BazigrBridge.deploy(SEPOLIA_TOKEN_ADDRESS);
    await sepoliaBridge.waitForDeployment();
    const sepoliaBridgeAddress = await sepoliaBridge.getAddress();
    
    console.log("✅ Sepolia Bridge deployed at:", sepoliaBridgeAddress);
    console.log("   Owner:", await sepoliaBridge.owner());
    console.log("   Source Chain:", await sepoliaBridge.SOURCE_CHAIN());
    console.log("   Target Chain:", await sepoliaBridge.TARGET_CHAIN());
    console.log("   Bridge Balance:", ethers.formatEther(await sepoliaBridge.getBridgeBalance()), "tokens");
    console.log("");
  } catch (error) {
    console.error("❌ Sepolia deployment failed:", error);
  }

  console.log("🎉 Deployment completed!");
  console.log("\n📝 Next Steps:");
  console.log("1. Update contract addresses in the frontend");
  console.log("2. Fund bridge contracts with initial tokens");
  console.log("3. Test the bridge functionality");
  console.log("4. Configure frontend with new addresses");
  
  console.log("\n🔧 Frontend Configuration:");
  console.log("Update these addresses in bridge-box.tsx:");
  console.log("const U2U_BRIDGE_ADDRESS = \"<U2U_BRIDGE_ADDRESS>\";");
  console.log("const SEPOLIA_BRIDGE_ADDRESS = \"<SEPOLIA_BRIDGE_ADDRESS>\";");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
