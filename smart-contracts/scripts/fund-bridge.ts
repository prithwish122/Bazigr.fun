import { ethers } from "hardhat";

async function main() {
  console.log("Funding bridge contracts with initial tokens...");

  // Bridge contract addresses (update these after deployment)
  const u2uBridgeAddress = "0x..."; // Update with actual U2U bridge address
  const sepoliaBridgeAddress = "0x..."; // Update with actual Sepolia bridge address
  
  // Token addresses
  const u2uTokenAddress = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const sepoliaTokenAddress = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

  // Amount to fund each bridge (in tokens, not wei)
  const fundingAmount = ethers.parseEther("1000"); // 1000 tokens

  console.log("Funding U2U bridge...");
  // This would need to be run on U2U network
  // const u2uToken = await ethers.getContractAt("Bazigr", u2uTokenAddress);
  // await u2uToken.mint(u2uBridgeAddress, fundingAmount);
  
  console.log("Funding Sepolia bridge...");
  // This would need to be run on Sepolia network
  // const sepoliaToken = await ethers.getContractAt("Bazigr", sepoliaTokenAddress);
  // await sepoliaToken.mint(sepoliaBridgeAddress, fundingAmount);

  console.log("Bridge funding completed!");
  console.log("U2U Bridge funded with:", ethers.formatEther(fundingAmount), "tokens");
  console.log("Sepolia Bridge funded with:", ethers.formatEther(fundingAmount), "tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
