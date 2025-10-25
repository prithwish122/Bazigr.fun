import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🚀 Deploying BazigrBridgeV2...");

  // Get the contract factory
  const BazigrBridgeV2 = await hre.ethers.getContractFactory("BazigrBridgeV2");

  // Contract addresses from deployment summary
  const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const SEPOLIA_TOKEN_ADDRESS = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

  // Deploy on U2U network
  console.log("📦 Deploying on U2U network...");
  const u2uBridge = await BazigrBridgeV2.deploy(U2U_TOKEN_ADDRESS);
  await u2uBridge.waitForDeployment();
  const u2uBridgeAddress = await u2uBridge.getAddress();
  console.log("✅ U2U Bridge V2 deployed to:", u2uBridgeAddress);

  // Deploy on Sepolia network
  console.log("📦 Deploying on Sepolia network...");
  const sepoliaBridge = await BazigrBridgeV2.deploy(SEPOLIA_TOKEN_ADDRESS);
  await sepoliaBridge.waitForDeployment();
  const sepoliaBridgeAddress = await sepoliaBridge.getAddress();
  console.log("✅ Sepolia Bridge V2 deployed to:", sepoliaBridgeAddress);

  // Fund the bridges with initial tokens
  console.log("💰 Funding bridges...");
  
  // Fund U2U bridge
  const u2uToken = await hre.ethers.getContractAt("Bazigr", U2U_TOKEN_ADDRESS);
  const fundAmount = hre.ethers.parseEther("1000"); // 1000 BAZ tokens
  
  try {
    const fundTx1 = await u2uToken.transfer(u2uBridgeAddress, fundAmount);
    await fundTx1.wait();
    console.log("✅ U2U Bridge V2 funded with 1000 BAZ tokens");
  } catch (error) {
    console.log("⚠️ Could not fund U2U bridge:", error);
  }

  // Fund Sepolia bridge
  const sepoliaToken = await hre.ethers.getContractAt("Bazigr", SEPOLIA_TOKEN_ADDRESS);
  
  try {
    const fundTx2 = await sepoliaToken.transfer(sepoliaBridgeAddress, fundAmount);
    await fundTx2.wait();
    console.log("✅ Sepolia Bridge V2 funded with 1000 BAZ tokens");
  } catch (error) {
    console.log("⚠️ Could not fund Sepolia bridge:", error);
  }

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
