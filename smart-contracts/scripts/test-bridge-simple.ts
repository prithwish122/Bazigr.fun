import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🧪 Simple Bridge Test...\n");

    // Contract addresses
    const U2U_BRIDGE_ADDRESS = "0xEA41526ac190C2521e046D98159eCCcC7a05F218";
    const SEPOLIA_BRIDGE_ADDRESS = "0xE8aDCF38C12cB70CcEAcE6cb7fbB1e6e5305550B";
    const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
    const SEPOLIA_TOKEN_ADDRESS = "0xDf2eEe4b129EA759500c7aDbc748b09cE8487e9c";

    console.log("📋 Contract Addresses:");
    console.log("U2U Bridge:", U2U_BRIDGE_ADDRESS);
    console.log("Sepolia Bridge:", SEPOLIA_BRIDGE_ADDRESS);
    console.log("U2U Token:", U2U_TOKEN_ADDRESS);
    console.log("Sepolia Token:", SEPOLIA_TOKEN_ADDRESS);
    console.log("");

    // Test U2U Bridge
    console.log("🌐 Testing U2U Bridge...");
    const u2uRpcUrl = "https://rpc-mainnet.u2u.xyz";
    const u2uPrivateKey = process.env.U2U_PRIVATE_KEY || "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
    const u2uProvider = new JsonRpcProvider(u2uRpcUrl);
    const u2uDeployer = new Wallet(u2uPrivateKey, u2uProvider);

    try {
        const u2uBridgeArtifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
        const u2uBridgeFactory = new ContractFactory(u2uBridgeArtifact.abi, u2uBridgeArtifact.bytecode, u2uDeployer);
        const u2uBridge = u2uBridgeFactory.attach(U2U_BRIDGE_ADDRESS);

        const u2uBalance = await u2uBridge.getBridgeBalance();
        const u2uOwner = await u2uBridge.owner();
        const u2uSourceChain = await u2uBridge.SOURCE_CHAIN();
        const u2uTargetChain = await u2uBridge.TARGET_CHAIN();
        const u2uPaused = await u2uBridge.paused();

        console.log("✅ U2U Bridge Status:");
        console.log("   Balance:", formatEther(u2uBalance), "BAZ");
        console.log("   Owner:", u2uOwner);
        console.log("   Source Chain:", u2uSourceChain);
        console.log("   Target Chain:", u2uTargetChain);
        console.log("   Paused:", u2uPaused);
        console.log("");
    } catch (error) {
        console.log("❌ U2U Bridge Error:", error);
    }

    // Test Sepolia Bridge
    console.log("🌐 Testing Sepolia Bridge...");
    const sepoliaRpcUrl = "https://ethereum-sepolia.publicnode.com";
    const sepoliaPrivateKey = process.env.SEPOLIA_PRIVATE_KEY || "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
    const sepoliaProvider = new JsonRpcProvider(sepoliaRpcUrl);
    const sepoliaDeployer = new Wallet(sepoliaPrivateKey, sepoliaProvider);

    try {
        const sepoliaBridgeArtifact = await hre.artifacts.readArtifact("contracts/SepoliaBridge.sol:SepoliaBridge");
        const sepoliaBridgeFactory = new ContractFactory(sepoliaBridgeArtifact.abi, sepoliaBridgeArtifact.bytecode, sepoliaDeployer);
        const sepoliaBridge = sepoliaBridgeFactory.attach(SEPOLIA_BRIDGE_ADDRESS);

        const sepoliaBalance = await sepoliaBridge.getBridgeBalance();
        const sepoliaOwner = await sepoliaBridge.owner();
        const sepoliaSourceChain = await sepoliaBridge.SOURCE_CHAIN();
        const sepoliaTargetChain = await sepoliaBridge.TARGET_CHAIN();
        const sepoliaPaused = await sepoliaBridge.paused();

        console.log("✅ Sepolia Bridge Status:");
        console.log("   Balance:", formatEther(sepoliaBalance), "BAZ");
        console.log("   Owner:", sepoliaOwner);
        console.log("   Source Chain:", sepoliaSourceChain);
        console.log("   Target Chain:", sepoliaTargetChain);
        console.log("   Paused:", sepoliaPaused);
        console.log("");
    } catch (error) {
        console.log("❌ Sepolia Bridge Error:", error);
    }

    console.log("🎉 Bridge Test Complete!");
    console.log("\n📝 Frontend Configuration:");
    console.log("The frontend should use these addresses:");
    console.log(`const U2U_BRIDGE_ADDRESS = "${U2U_BRIDGE_ADDRESS}";`);
    console.log(`const SEPOLIA_BRIDGE_ADDRESS = "${SEPOLIA_BRIDGE_ADDRESS}";`);
    console.log(`const U2U_TOKEN_ADDRESS = "${U2U_TOKEN_ADDRESS}";`);
    console.log(`const SEPOLIA_TOKEN_ADDRESS = "${SEPOLIA_TOKEN_ADDRESS}";`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
