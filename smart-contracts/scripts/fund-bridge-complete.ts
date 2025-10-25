import { ethers } from "hardhat";

async function main() {
  console.log("💰 Funding Bridge Contracts...\n");

  // Update these addresses after deployment
  const U2U_BRIDGE_ADDRESS = "0x..."; // Update with actual U2U bridge address
  const SEPOLIA_BRIDGE_ADDRESS = "0x..."; // Update with actual Sepolia bridge address
  
  const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const SEPOLIA_TOKEN_ADDRESS = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

  // Funding amount (1000 tokens each)
  const fundingAmount = ethers.parseEther("1000");

  console.log("📋 Configuration:");
  console.log("U2U Bridge:", U2U_BRIDGE_ADDRESS);
  console.log("Sepolia Bridge:", SEPOLIA_BRIDGE_ADDRESS);
  console.log("Funding Amount:", ethers.formatEther(fundingAmount), "tokens each");
  console.log("");

  try {
    // Fund U2U Bridge
    console.log("🌐 Funding U2U Bridge...");
    const u2uToken = await ethers.getContractAt("Bazigr", U2U_TOKEN_ADDRESS);
    
    // Mint tokens to bridge
    const tx1 = await u2uToken.mint(U2U_BRIDGE_ADDRESS, fundingAmount);
    await tx1.wait();
    
    console.log("✅ U2U Bridge funded with", ethers.formatEther(fundingAmount), "tokens");
    console.log("   Transaction:", tx1.hash);
    console.log("");

  } catch (error) {
    console.error("❌ U2U funding failed:", error);
  }

  try {
    // Fund Sepolia Bridge
    console.log("🌐 Funding Sepolia Bridge...");
    const sepoliaToken = await ethers.getContractAt("Bazigr", SEPOLIA_TOKEN_ADDRESS);
    
    // Mint tokens to bridge
    const tx2 = await sepoliaToken.mint(SEPOLIA_BRIDGE_ADDRESS, fundingAmount);
    await tx2.wait();
    
    console.log("✅ Sepolia Bridge funded with", ethers.formatEther(fundingAmount), "tokens");
    console.log("   Transaction:", tx2.hash);
    console.log("");

  } catch (error) {
    console.error("❌ Sepolia funding failed:", error);
  }

  console.log("🎉 Bridge funding completed!");
  console.log("\n📝 Next Steps:");
  console.log("1. Verify bridge balances");
  console.log("2. Test bridge functionality");
  console.log("3. Update frontend with bridge addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
