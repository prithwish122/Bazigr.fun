import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("💰 Funding Bridge Contracts...\n");

    const privateKey = "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
    const fundingAmount = "1000"; // 1000 tokens

    // U2U Network
    console.log("🌐 Funding U2U Bridge...");
    const u2uRpcUrl = "https://rpc-mainnet.u2u.xyz";
    const u2uTokenAddress = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
    const u2uBridgeAddress = "0xEA41526ac190C2521e046D98159eCCcC7a05F218";

    const u2uProvider = new JsonRpcProvider(u2uRpcUrl);
    const u2uDeployer = new Wallet(privateKey, u2uProvider);

    try {
        const u2uToken = new ContractFactory(
            (await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr")).abi,
            (await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr")).bytecode,
            u2uDeployer
        ).attach(u2uTokenAddress);

        const u2uTx = await u2uToken.mint(u2uBridgeAddress, fundingAmount);
        await u2uTx.wait();
        console.log("✅ U2U Bridge funded with", fundingAmount, "tokens");
        console.log("   Transaction:", u2uTx.hash);
    } catch (error) {
        console.log("❌ U2U funding failed:", error);
    }

    console.log("");

    // Sepolia Network
    console.log("🌐 Funding Sepolia Bridge...");
    const sepoliaRpcUrl = "https://sepolia.drpc.org";
    const sepoliaTokenAddress = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";
    const sepoliaBridgeAddress = "0xB6e8DE6aBE31F36415297e38f87e49890a257A0A";

    const sepoliaProvider = new JsonRpcProvider(sepoliaRpcUrl);
    const sepoliaDeployer = new Wallet(privateKey, sepoliaProvider);

    try {
        const sepoliaToken = new ContractFactory(
            (await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr")).abi,
            (await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr")).bytecode,
            sepoliaDeployer
        ).attach(sepoliaTokenAddress);

        const sepoliaTx = await sepoliaToken.mint(sepoliaBridgeAddress, fundingAmount);
        await sepoliaTx.wait();
        console.log("✅ Sepolia Bridge funded with", fundingAmount, "tokens");
        console.log("   Transaction:", sepoliaTx.hash);
    } catch (error) {
        console.log("❌ Sepolia funding failed:", error);
    }

    console.log("\n🎉 Bridge funding completed!");
    console.log("\n📝 Bridge Addresses:");
    console.log("U2U Bridge:", u2uBridgeAddress);
    console.log("Sepolia Bridge:", sepoliaBridgeAddress);
    console.log("\n📝 Next Steps:");
    console.log("1. Test the bridge functionality");
    console.log("2. Verify token balances on both networks");
    console.log("3. Test cross-chain transfers");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
