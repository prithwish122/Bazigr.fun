import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🪙 Minting Sepolia Tokens...\n");

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

    // Mint more tokens to deployer
    const mintAmount = "10000"; // 10,000 tokens
    console.log(`\n🪙 Minting ${mintAmount} BAZ tokens to deployer...`);
    
    const mintTx = await token.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log("✅ Tokens minted successfully");
    console.log("Mint tx:", mintTx.hash);

    // Check new balance
    const newBalance = await token.balanceOf(deployer.address);
    console.log("New deployer balance:", formatEther(newBalance), "BAZ");

    // Fund the bridge
    const fundAmount = "10000"; // 10,000 tokens
    console.log(`\n💰 Funding bridge with ${fundAmount} BAZ tokens...`);
    
    // Use mint function directly to bridge address to avoid transfer issues
    const fundTx = await token.mint(bridgeAddress, fundAmount);
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
