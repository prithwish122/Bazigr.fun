import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("💰 Funding Sepolia Bridge...\n");

    // Sepolia configuration
    const rpcUrl = "https://ethereum-sepolia.publicnode.com";
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY || "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    console.log("Deployer:", deployer.address);
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer balance:", formatEther(balance), "ETH");

    // Contract addresses
    const tokenAddress = "0xDf2eEe4b129EA759500c7aDbc748b09cE8487e9c";
    const bridgeAddress = "0xE8aDCF38C12cB70CcEAcE6cb7fbB1e6e5305550B";

    console.log("Token Address:", tokenAddress);
    console.log("Bridge Address:", bridgeAddress);
    console.log("");

    // Get token contract
    const tokenArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
    const tokenFactory = new ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, deployer);
    const token = tokenFactory.attach(tokenAddress);

    // Check deployer's token balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("Deployer token balance:", formatEther(deployerBalance), "BAZ");

    if (deployerBalance === 0n) {
        console.log("❌ Deployer has no tokens. Minting tokens...");
        await token.mint(deployer.address, "10000");
        console.log("✅ Minted 10,000 BAZ tokens to deployer");
    }

    // Fund the bridge
    const fundAmount = "5000"; // 5,000 tokens
    console.log(`\n💰 Funding bridge with ${fundAmount} BAZ tokens...`);
    
    const fundTx = await token.transfer(bridgeAddress, fundAmount);
    await fundTx.wait();
    console.log("✅ Bridge funded successfully");
    console.log("Funding tx:", fundTx.hash);

    // Verify funding
    const bridgeArtifact = await hre.artifacts.readArtifact("contracts/SepoliaBridge.sol:SepoliaBridge");
    const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);
    const bridge = bridgeFactory.attach(bridgeAddress);

    const bridgeBalance = await bridge.getBridgeBalance();
    console.log("\n✅ Verification:");
    console.log("Bridge balance:", formatEther(bridgeBalance), "BAZ");

    console.log("\n🎉 Sepolia Bridge funding completed!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
