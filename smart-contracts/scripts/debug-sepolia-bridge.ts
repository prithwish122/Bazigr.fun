import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🔍 Debugging Sepolia Bridge...\n");

    // Sepolia configuration
    const rpcUrl = "https://ethereum-sepolia.publicnode.com";
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY || "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    // Contract addresses
    const tokenAddress = "0xDf2eEe4b129EA759500c7aDbc748b09cE8487e9c";
    const bridgeAddress = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";

    console.log("Token Address:", tokenAddress);
    console.log("Bridge Address:", bridgeAddress);
    console.log("");

    // Check token contract
    try {
        const tokenArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
        const tokenFactory = new ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, deployer);
        const token = tokenFactory.attach(tokenAddress);

        const tokenName = await token.name();
        const tokenSymbol = await token.symbol();
        const tokenDecimals = await token.decimals();
        const tokenBalance = await token.balanceOf(bridgeAddress);

        console.log("✅ Token Contract Status:");
        console.log("   Name:", tokenName);
        console.log("   Symbol:", tokenSymbol);
        console.log("   Decimals:", tokenDecimals);
        console.log("   Bridge Balance:", formatEther(tokenBalance), "BAZ");
        console.log("");
    } catch (error) {
        console.log("❌ Token Contract Error:", error);
    }

    // Check bridge contract - try different approaches
    console.log("🔍 Checking Bridge Contract...");
    
    // Try with SepoliaBridge artifact
    try {
        const bridgeArtifact = await hre.artifacts.readArtifact("contracts/SepoliaBridge.sol:SepoliaBridge");
        const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);
        const bridge = bridgeFactory.attach(bridgeAddress);

        const bridgeBalance = await bridge.getBridgeBalance();
        const bridgeOwner = await bridge.owner();
        const bridgeToken = await bridge.bazigrToken();
        const sourceChain = await bridge.SOURCE_CHAIN();
        const targetChain = await bridge.TARGET_CHAIN();
        const paused = await bridge.paused();

        console.log("✅ SepoliaBridge Contract Status:");
        console.log("   Balance:", formatEther(bridgeBalance), "BAZ");
        console.log("   Owner:", bridgeOwner);
        console.log("   Token:", bridgeToken);
        console.log("   Source Chain:", sourceChain);
        console.log("   Target Chain:", targetChain);
        console.log("   Paused:", paused);
        console.log("");
    } catch (error) {
        console.log("❌ SepoliaBridge Error:", error);
    }

    // Try with BazigrBridge artifact
    try {
        const bridgeArtifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
        const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);
        const bridge = bridgeFactory.attach(bridgeAddress);

        const bridgeBalance = await bridge.getBridgeBalance();
        const bridgeOwner = await bridge.owner();
        const bridgeToken = await bridge.bazigrToken();
        const sourceChain = await bridge.SOURCE_CHAIN();
        const targetChain = await bridge.TARGET_CHAIN();
        const paused = await bridge.paused();

        console.log("✅ BazigrBridge Contract Status:");
        console.log("   Balance:", formatEther(bridgeBalance), "BAZ");
        console.log("   Owner:", bridgeOwner);
        console.log("   Token:", bridgeToken);
        console.log("   Source Chain:", sourceChain);
        console.log("   Target Chain:", targetChain);
        console.log("   Paused:", paused);
        console.log("");
    } catch (error) {
        console.log("❌ BazigrBridge Error:", error);
    }

    console.log("🎉 Debug Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
