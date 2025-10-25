import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BazigrBridge to Sepolia...");

  // Get the contract factory
  const BazigrBridge = await ethers.getContractFactory("BazigrBridge");

  // Deploy the bridge contract
  // You need to provide the Bazigr token address on Sepolia network
  const bazigrTokenAddress = "0xD5e91C9ADB874601E5980521A9665962EaB950FB"; // Replace with actual Bazigr token address on Sepolia
  
  const bridge = await BazigrBridge.deploy(bazigrTokenAddress);
  await bridge.waitForDeployment();

  const bridgeAddress = await bridge.getAddress();
  
  console.log("BazigrBridge deployed to Sepolia at:", bridgeAddress);
  console.log("Bazigr Token Address:", bazigrTokenAddress);
  console.log("Owner:", await bridge.owner());
  
  // Verify the deployment
  console.log("Bridge balance:", await bridge.getBridgeBalance());
  console.log("Source chain:", await bridge.SOURCE_CHAIN());
  console.log("Target chain:", await bridge.TARGET_CHAIN());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
