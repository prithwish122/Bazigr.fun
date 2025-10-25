import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🚀 Deploying Bazigr Bridge...\n");

    // Get network configuration
    const network = hre.network.name || "u2uMainnet";
    console.log("Network:", network);

    let rpcUrl: string;
    let privateKey: string;
    let tokenAddress: string;

    if (network === "u2uMainnet" || network === "undefined") {
        rpcUrl = process.env.U2U_RPC_URL || "https://rpc-mainnet.u2u.xyz";
        privateKey = (process.env.U2U_PRIVATE_KEY || "").startsWith("0x")
            ? (process.env.U2U_PRIVATE_KEY as string)
            : `0x${process.env.U2U_PRIVATE_KEY || ""}`;
        tokenAddress = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
    } else if (network === "sepolia") {
        rpcUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
        privateKey = (process.env.SEPOLIA_PRIVATE_KEY || "").startsWith("0x")
            ? (process.env.SEPOLIA_PRIVATE_KEY as string)
            : `0x${process.env.SEPOLIA_PRIVATE_KEY || ""}`;
        tokenAddress = "0xD5e91C9ADB874601E5980521A9665962EaB950FB";
    } else {
        throw new Error("Unsupported network");
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    console.log("Deployer:", deployer.address);
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer balance:", formatEther(balance), "ETH");
    console.log("Token Address:", tokenAddress);
    console.log("");

    // Deploy bridge contract
    console.log("🔨 Deploying BazigrBridge...");
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

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("1. Fund the bridge contract with initial tokens");
    console.log("2. Update frontend with bridge address:", bridgeAddress);
    console.log("3. Test the bridge functionality");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
