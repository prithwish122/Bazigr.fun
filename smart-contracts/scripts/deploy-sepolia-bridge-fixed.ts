import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🚀 Deploying Fixed Sepolia Bridge...\n");

    // Sepolia configuration
    const rpcUrl = "https://ethereum-sepolia.publicnode.com";
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY || "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    console.log("Deployer:", deployer.address);
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer balance:", formatEther(balance), "ETH");
    console.log("");

    // Use existing token
    const tokenAddress = "0xDf2eEe4b129EA759500c7aDbc748b09cE8487e9c";
    console.log("Using existing token:", tokenAddress);

    // Deploy Sepolia Bridge
    console.log("\n🌉 Deploying Sepolia Bridge...");
    const bridgeArtifact = await hre.artifacts.readArtifact("contracts/SepoliaBridge.sol:SepoliaBridge");
    const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);

    const bridge = await bridgeFactory.deploy(tokenAddress);
    const bridgeReceipt = await bridge.deploymentTransaction()?.wait();
    const bridgeAddress = await bridge.getAddress();
    
    console.log("✅ Sepolia Bridge deployed to:", bridgeAddress);
    if (bridgeReceipt) {
        console.log("Bridge deployment tx:", bridgeReceipt.hash);
    }

    // Fund the bridge with tokens
    console.log("\n💰 Funding Bridge Contract...");
    const tokenArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
    const tokenFactory = new ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, deployer);
    const token = tokenFactory.attach(tokenAddress);
    
    const fundAmount = "5000"; // 5,000 tokens
    await token.transfer(bridgeAddress, fundAmount);
    console.log("✅ Funded bridge with 5,000 BAZ tokens");

    // Verify deployment
    console.log("\n🔍 Verifying Deployment...");
    const bridgeBalance = await bridge.getBridgeBalance();
    const bridgeOwner = await bridge.owner();
    const bridgeToken = await bridge.bazigrToken();
    const sourceChain = await bridge.SOURCE_CHAIN();
    const targetChain = await bridge.TARGET_CHAIN();
    const paused = await bridge.paused();

    console.log("✅ Verification Complete:");
    console.log("   Bridge Address:", bridgeAddress);
    console.log("   Token Address:", tokenAddress);
    console.log("   Owner:", bridgeOwner);
    console.log("   Token Contract:", bridgeToken);
    console.log("   Source Chain:", sourceChain);
    console.log("   Target Chain:", targetChain);
    console.log("   Bridge Balance:", formatEther(bridgeBalance), "BAZ");
    console.log("   Paused:", paused);

    // Update frontend configuration
    console.log("\n📝 Frontend Configuration:");
    console.log("Update these addresses in client/src/app/components/bridge/bridge-box.tsx:");
    console.log(`const SEPOLIA_BRIDGE_ADDRESS = "${bridgeAddress}";`);
    console.log(`const SEPOLIA_TOKEN_ADDRESS = "${tokenAddress}";`);

    console.log("\n🎉 Sepolia Bridge deployment completed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
