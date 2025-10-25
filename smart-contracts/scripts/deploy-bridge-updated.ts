import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🚀 Deploying Updated Bazigr Bridge...\n");

    // Contract addresses from deployment summary
    const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
    const SEPOLIA_TOKEN_ADDRESS = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

    // Deploy on U2U network
    console.log("📦 Deploying on U2U network...");
    const u2uRpcUrl = "https://rpc-mainnet.u2u.xyz";
    const u2uPrivateKey = "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
    
    const u2uProvider = new JsonRpcProvider(u2uRpcUrl);
    const u2uDeployer = new Wallet(u2uPrivateKey, u2uProvider);
    
    console.log("U2U Deployer:", u2uDeployer.address);
    
    try {
        const u2uBalance = await u2uProvider.getBalance(u2uDeployer.address);
        console.log("U2U Deployer balance:", formatEther(u2uBalance), "U2U");
    } catch (error) {
        console.log("Could not get U2U balance:", error);
    }

    // Deploy U2U bridge
    console.log("\n🔨 Deploying U2U Bridge...");
    try {
        const u2uArtifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
        const u2uFactory = new ContractFactory(u2uArtifact.abi, u2uArtifact.bytecode, u2uDeployer);

        const u2uBridge = await u2uFactory.deploy(U2U_TOKEN_ADDRESS);
        const u2uReceipt = await u2uBridge.deploymentTransaction()?.wait();

        const u2uBridgeAddress = await u2uBridge.getAddress();
        console.log("✅ U2U Bridge deployed to:", u2uBridgeAddress);
        if (u2uReceipt) {
            console.log("U2U Deployment tx:", u2uReceipt.hash);
        }

        // Get U2U contract info
        console.log("\n📋 U2U Contract Information:");
        console.log("Owner:", await u2uBridge.owner());
        console.log("Token:", await u2uBridge.bazigrToken());
        console.log("Source Chain:", await u2uBridge.SOURCE_CHAIN());
        console.log("Target Chain:", await u2uBridge.TARGET_CHAIN());
        console.log("Bridge Balance:", formatEther(await u2uBridge.getBridgeBalance()), "tokens");

    } catch (error) {
        console.error("❌ U2U Bridge deployment failed:", error);
        throw error;
    }

    // Deploy on Sepolia network
    console.log("\n📦 Deploying on Sepolia network...");
    const sepoliaRpcUrl = "https://sepolia.infura.io/v3/147ac26d4875d31fbecca54c782a112d";
    const sepoliaPrivateKey = "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
    
    const sepoliaProvider = new JsonRpcProvider(sepoliaRpcUrl);
    const sepoliaDeployer = new Wallet(sepoliaPrivateKey, sepoliaProvider);
    
    console.log("Sepolia Deployer:", sepoliaDeployer.address);
    
    try {
        const sepoliaBalance = await sepoliaProvider.getBalance(sepoliaDeployer.address);
        console.log("Sepolia Deployer balance:", formatEther(sepoliaBalance), "ETH");
    } catch (error) {
        console.log("Could not get Sepolia balance:", error);
    }

    // Deploy Sepolia bridge
    console.log("\n🔨 Deploying Sepolia Bridge...");
    try {
        const sepoliaArtifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
        const sepoliaFactory = new ContractFactory(sepoliaArtifact.abi, sepoliaArtifact.bytecode, sepoliaDeployer);

        const sepoliaBridge = await sepoliaFactory.deploy(SEPOLIA_TOKEN_ADDRESS);
        const sepoliaReceipt = await sepoliaBridge.deploymentTransaction()?.wait();

        const sepoliaBridgeAddress = await sepoliaBridge.getAddress();
        console.log("✅ Sepolia Bridge deployed to:", sepoliaBridgeAddress);
        if (sepoliaReceipt) {
            console.log("Sepolia Deployment tx:", sepoliaReceipt.hash);
        }

        // Get Sepolia contract info
        console.log("\n📋 Sepolia Contract Information:");
        console.log("Owner:", await sepoliaBridge.owner());
        console.log("Token:", await sepoliaBridge.bazigrToken());
        console.log("Source Chain:", await sepoliaBridge.SOURCE_CHAIN());
        console.log("Target Chain:", await sepoliaBridge.TARGET_CHAIN());
        console.log("Bridge Balance:", formatEther(await sepoliaBridge.getBridgeBalance()), "tokens");

    } catch (error) {
        console.error("❌ Sepolia Bridge deployment failed:", error);
        throw error;
    }

    console.log("\n🎉 Bridge deployment completed successfully!");
    console.log("\n📝 Contract Addresses:");
    console.log("U2U Bridge:", u2uBridgeAddress);
    console.log("Sepolia Bridge:", sepoliaBridgeAddress);
    
    console.log("\n🔧 Frontend Configuration:");
    console.log(`const U2U_BRIDGE_ADDRESS = "${u2uBridgeAddress}";`);
    console.log(`const SEPOLIA_BRIDGE_ADDRESS = "${sepoliaBridgeAddress}";`);
    
    console.log("\n📋 Next Steps:");
    console.log("1. Fund both bridge contracts with initial tokens");
    console.log("2. Update frontend with new bridge addresses");
    console.log("3. Test the bridge functionality");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
