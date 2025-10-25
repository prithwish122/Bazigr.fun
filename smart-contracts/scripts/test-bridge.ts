import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🧪 Testing Bridge Functionality...\n");

    // Contract addresses
    const U2U_BRIDGE_ADDRESS = "0xEA41526ac190C2521e046D98159eCCcC7a05F218";
    const SEPOLIA_BRIDGE_ADDRESS = "0xE8aDCF38C12cB70CcEAcE6cb7fbB1e6e5305550B";
    const U2U_TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
    const SEPOLIA_TOKEN_ADDRESS = "0xDf2eEe4b129EA759500c7aDbc748b09cE8487e9c";

    // U2U Network
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

        console.log("✅ U2U Bridge Status:");
        console.log("   Address:", U2U_BRIDGE_ADDRESS);
        console.log("   Balance:", formatEther(u2uBalance), "BAZ");
        console.log("   Owner:", u2uOwner);
        console.log("   Source Chain:", u2uSourceChain);
        console.log("   Target Chain:", u2uTargetChain);
        console.log("");
    } catch (error) {
        console.log("❌ U2U Bridge Error:", error);
    }

    // Sepolia Network
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

        console.log("✅ Sepolia Bridge Status:");
        console.log("   Address:", SEPOLIA_BRIDGE_ADDRESS);
        console.log("   Balance:", formatEther(sepoliaBalance), "BAZ");
        console.log("   Owner:", sepoliaOwner);
        console.log("   Source Chain:", sepoliaSourceChain);
        console.log("   Target Chain:", sepoliaTargetChain);
        console.log("");
    } catch (error) {
        console.log("❌ Sepolia Bridge Error:", error);
    }

    // Token Contracts
    console.log("🪙 Testing Token Contracts...");
    
    // U2U Token
    try {
        const u2uTokenArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
        const u2uTokenFactory = new ContractFactory(u2uTokenArtifact.abi, u2uTokenArtifact.bytecode, u2uDeployer);
        const u2uToken = u2uTokenFactory.attach(U2U_TOKEN_ADDRESS);

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
        const sepoliaTokenArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
        const sepoliaTokenFactory = new ContractFactory(sepoliaTokenArtifact.abi, sepoliaTokenArtifact.bytecode, sepoliaDeployer);
        const sepoliaToken = sepoliaTokenFactory.attach(SEPOLIA_TOKEN_ADDRESS);

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

    console.log("🎉 Bridge Test Complete!");
    console.log("\n📝 Summary:");
    console.log("U2U Bridge:", U2U_BRIDGE_ADDRESS);
    console.log("Sepolia Bridge:", SEPOLIA_BRIDGE_ADDRESS);
    console.log("U2U Token:", U2U_TOKEN_ADDRESS);
    console.log("Sepolia Token:", SEPOLIA_TOKEN_ADDRESS);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
