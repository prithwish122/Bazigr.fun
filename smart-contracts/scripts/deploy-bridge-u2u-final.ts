import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🚀 Deploying Bazigr Bridge to U2U Mainnet...\n");

    const rpcUrl = "https://rpc-mainnet.u2u.xyz";
    const privateKey = "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
    const tokenAddress = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";

    console.log("Network: U2U Mainnet");
    console.log("RPC URL:", rpcUrl);
    console.log("Token Address:", tokenAddress);
    console.log("");

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    console.log("Deployer:", deployer.address);
    
    try {
        const balance = await provider.getBalance(deployer.address);
        console.log("Deployer balance:", formatEther(balance), "ETH");
    } catch (error) {
        console.log("Could not get balance:", error);
    }

    console.log("");

    // Deploy bridge contract
    console.log("🔨 Deploying BazigrBridge...");
    try {
        const artifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
        const factory = new ContractFactory(artifact.abi, artifact.bytecode, deployer);

        const bridge = await factory.deploy(tokenAddress);
        const receipt = await bridge.deploymentTransaction()?.wait();

        const bridgeAddress = await bridge.getAddress();
        console.log("✅ BazigrBridge deployed to:", bridgeAddress);
        if (receipt) {
            console.log("Deployment tx:", receipt.hash);
        }

        // Get contract info
        console.log("\n📋 Contract Information:");
        console.log("Owner:", await bridge.owner());
        console.log("Token:", await bridge.bazigrToken());
        console.log("Source Chain:", await bridge.SOURCE_CHAIN());
        console.log("Target Chain:", await bridge.TARGET_CHAIN());
        console.log("Bridge Balance:", formatEther(await bridge.getBridgeBalance()), "tokens");

        console.log("\n🎉 U2U Bridge deployment completed successfully!");
        console.log("\n📝 Next Steps:");
        console.log("1. Fund the bridge contract with initial tokens");
        console.log("2. Update frontend with bridge address:", bridgeAddress);
        console.log("3. Deploy to Sepolia network");
        
        console.log("\n🔧 Frontend Configuration:");
        console.log(`const U2U_BRIDGE_ADDRESS = "${bridgeAddress}";`);
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
