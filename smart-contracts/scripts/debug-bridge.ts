import hre from "hardhat";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🔍 Debugging Bridge Contracts...\n");

  // Contract addresses
  const U2U_BRIDGE_ADDRESS = "0xEA41526ac190C2521e046D98159eCCcC7a05F218";
  const SEPOLIA_BRIDGE_ADDRESS = "0xB6e8DE6aBE31F36415297e38f87e49890a257A0A";
  const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const SEPOLIA_TOKEN_ADDRESS = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

  // Check U2U Bridge
  console.log("🌐 Checking U2U Bridge...");
  try {
    const u2uProvider = new ethers.JsonRpcProvider("https://rpc-mainnet.u2u.xyz");
    const u2uBridge = new ethers.Contract(
      U2U_BRIDGE_ADDRESS,
      (await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge")).abi,
      u2uProvider
    );

    const u2uBalance = await u2uBridge.getBridgeBalance();
    const u2uOwner = await u2uBridge.owner();
    const u2uToken = await u2uBridge.bazigrToken();
    const u2uSourceChain = await u2uBridge.SOURCE_CHAIN();
    const u2uTargetChain = await u2uBridge.TARGET_CHAIN();
    const u2uPaused = await u2uBridge.paused();

    console.log("✅ U2U Bridge Status:");
    console.log("   Address:", U2U_BRIDGE_ADDRESS);
    console.log("   Owner:", u2uOwner);
    console.log("   Token:", u2uToken);
    console.log("   Source Chain:", u2uSourceChain);
    console.log("   Target Chain:", u2uTargetChain);
    console.log("   Balance:", ethers.formatEther(u2uBalance), "BAZ");
    console.log("   Paused:", u2uPaused);
    console.log("");

  } catch (error) {
    console.log("❌ U2U Bridge Error:", error);
  }

  // Check Sepolia Bridge
  console.log("🌐 Checking Sepolia Bridge...");
  try {
    const sepoliaProvider = new ethers.JsonRpcProvider("https://sepolia.drpc.org");
    const sepoliaBridge = new ethers.Contract(
      SEPOLIA_BRIDGE_ADDRESS,
      (await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge")).abi,
      sepoliaProvider
    );

    const sepoliaBalance = await sepoliaBridge.getBridgeBalance();
    const sepoliaOwner = await sepoliaBridge.owner();
    const sepoliaToken = await sepoliaBridge.bazigrToken();
    const sepoliaSourceChain = await sepoliaBridge.SOURCE_CHAIN();
    const sepoliaTargetChain = await sepoliaBridge.TARGET_CHAIN();
    const sepoliaPaused = await sepoliaBridge.paused();

    console.log("✅ Sepolia Bridge Status:");
    console.log("   Address:", SEPOLIA_BRIDGE_ADDRESS);
    console.log("   Owner:", sepoliaOwner);
    console.log("   Token:", sepoliaToken);
    console.log("   Source Chain:", sepoliaSourceChain);
    console.log("   Target Chain:", sepoliaTargetChain);
    console.log("   Balance:", ethers.formatEther(sepoliaBalance), "BAZ");
    console.log("   Paused:", sepoliaPaused);
    console.log("");

  } catch (error) {
    console.log("❌ Sepolia Bridge Error:", error);
  }

  // Check Token Contracts
  console.log("🪙 Checking Token Contracts...");
  
  // U2U Token
  try {
    const u2uProvider = new ethers.JsonRpcProvider("https://rpc-mainnet.u2u.xyz");
    const u2uToken = new ethers.Contract(
      U2U_TOKEN_ADDRESS,
      (await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr")).abi,
      u2uProvider
    );

    const u2uTokenName = await u2uToken.name();
    const u2uTokenSymbol = await u2uToken.symbol();
    const u2uTokenDecimals = await u2uToken.decimals();

    console.log("✅ U2U Token Status:");
    console.log("   Address:", U2U_TOKEN_ADDRESS);
    console.log("   Name:", u2uTokenName);
    console.log("   Symbol:", u2uTokenSymbol);
    console.log("   Decimals:", u2uTokenDecimals);
    console.log("");

  } catch (error) {
    console.log("❌ U2U Token Error:", error);
  }

  // Sepolia Token
  try {
    const sepoliaProvider = new ethers.JsonRpcProvider("https://sepolia.drpc.org");
    const sepoliaToken = new ethers.Contract(
      SEPOLIA_TOKEN_ADDRESS,
      (await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr")).abi,
      sepoliaProvider
    );

    const sepoliaTokenName = await sepoliaToken.name();
    const sepoliaTokenSymbol = await sepoliaToken.symbol();
    const sepoliaTokenDecimals = await sepoliaToken.decimals();

    console.log("✅ Sepolia Token Status:");
    console.log("   Address:", SEPOLIA_TOKEN_ADDRESS);
    console.log("   Name:", sepoliaTokenName);
    console.log("   Symbol:", sepoliaTokenSymbol);
    console.log("   Decimals:", sepoliaTokenDecimals);
    console.log("");

  } catch (error) {
    console.log("❌ Sepolia Token Error:", error);
  }

  console.log("🎉 Bridge Debug Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
