import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BazigrBridge to U2U Mainnet...");

  // Get the contract factory
  const BazigrBridge = await ethers.getContractFactory("BazigrBridge");

  // Deploy the bridge contract
  // You need to provide the Bazigr token address on U2U network
  const bazigrTokenAddress = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80"; // Replace with actual Bazigr token address on U2U
  
  const bridge = await BazigrBridge.deploy(bazigrTokenAddress);
  await bridge.waitForDeployment();

  const bridgeAddress = await bridge.getAddress();
  
  console.log("BazigrBridge deployed to U2U Mainnet at:", bridgeAddress);
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
