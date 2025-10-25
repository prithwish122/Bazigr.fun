import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🚀 Deploying BazigrBridgeV2...");

  // Contract addresses from deployment summary
  const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const SEPOLIA_TOKEN_ADDRESS = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

  // Deploy on U2U network
  console.log("📦 Deploying on U2U network...");
  const u2uBridge = await hre.ethers.getContractFactory("BazigrBridgeV2");
  const u2uBridgeDeployed = await u2uBridge.deploy(U2U_TOKEN_ADDRESS);
  await u2uBridgeDeployed.waitForDeployment();
  const u2uBridgeAddress = await u2uBridgeDeployed.getAddress();
  console.log("✅ U2U Bridge V2 deployed to:", u2uBridgeAddress);

  // Deploy on Sepolia network
  console.log("📦 Deploying on Sepolia network...");
  const sepoliaBridge = await hre.ethers.getContractFactory("BazigrBridgeV2");
  const sepoliaBridgeDeployed = await sepoliaBridge.deploy(SEPOLIA_TOKEN_ADDRESS);
  await sepoliaBridgeDeployed.waitForDeployment();
  const sepoliaBridgeAddress = await sepoliaBridgeDeployed.getAddress();
  console.log("✅ Sepolia Bridge V2 deployed to:", sepoliaBridgeAddress);

  console.log("\n🎉 Deployment Summary:");
  console.log("=====================");
  console.log("U2U Bridge V2:", u2uBridgeAddress);
  console.log("Sepolia Bridge V2:", sepoliaBridgeAddress);
  console.log("\n📝 Update your frontend with these new addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
