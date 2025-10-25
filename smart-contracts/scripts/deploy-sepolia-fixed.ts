import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🚀 Deploying Complete Sepolia Setup...\n");

    // Sepolia configuration
    const rpcUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
    const privateKey = (process.env.SEPOLIA_PRIVATE_KEY || "").startsWith("0x")
        ? (process.env.SEPOLIA_PRIVATE_KEY as string)
        : `0x${process.env.SEPOLIA_PRIVATE_KEY || ""}`;

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    console.log("Deployer:", deployer.address);
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer balance:", formatEther(balance), "ETH");
    console.log("");

    // Step 1: Deploy Bazigr Token on Sepolia
    console.log("🪙 Deploying Bazigr Token on Sepolia...");
    const tokenArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
    const tokenFactory = new ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, deployer);

    const token = await tokenFactory.deploy();
    const tokenReceipt = await token.deploymentTransaction()?.wait();
    const tokenAddress = await token.getAddress();
    
    console.log("✅ Bazigr Token deployed to:", tokenAddress);
    if (tokenReceipt) {
        console.log("Token deployment tx:", tokenReceipt.hash);
    }

    // Mint initial tokens to deployer
    const mintAmount = "10000"; // 10,000 tokens
    await token.mint(deployer.address, mintAmount);
    console.log("✅ Minted 10,000 BAZ tokens to deployer");

    // Step 2: Deploy Bridge Contract on Sepolia
    console.log("\n🌉 Deploying Bridge Contract on Sepolia...");
    const bridgeArtifact = await hre.artifacts.readArtifact("contracts/BazigrBridge.sol:BazigrBridge");
    const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);

    const bridge = await bridgeFactory.deploy(tokenAddress);
    const bridgeReceipt = await bridge.deploymentTransaction()?.wait();
    const bridgeAddress = await bridge.getAddress();
    
    console.log("✅ Bridge deployed to:", bridgeAddress);
    if (bridgeReceipt) {
        console.log("Bridge deployment tx:", bridgeReceipt.hash);
    }

    // Step 3: Fund the bridge with tokens
    console.log("\n💰 Funding Bridge Contract...");
    const fundAmount = "5000"; // 5,000 tokens
    await token.transfer(bridgeAddress, fundAmount);
    console.log("✅ Funded bridge with 5,000 BAZ tokens");

    // Step 4: Verify deployment
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

    // Step 5: Update frontend configuration
    console.log("\n📝 Frontend Configuration:");
    console.log("Update these addresses in client/src/app/components/bridge/bridge-box.tsx:");
    console.log(`const SEPOLIA_BRIDGE_ADDRESS = "${bridgeAddress}";`);
    console.log(`const SEPOLIA_TOKEN_ADDRESS = "${tokenAddress}";`);

    console.log("\n🎉 Sepolia deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend with new contract addresses");
    console.log("2. Test bridge functionality");
    console.log("3. Verify token transfers");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
