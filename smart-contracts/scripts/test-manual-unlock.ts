import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther, ethers } from "ethers";
import "dotenv/config";

async function main() {
    console.log("🧪 Testing Manual Unlock...\n");

    // Sepolia configuration
    const rpcUrl = "https://ethereum-sepolia.publicnode.com";
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY || "0x9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    console.log("Deployer:", deployer.address);

    // Contract addresses
    const bridgeAddress = "0xE8aDCF38C12cB70CcEAcE6cb7fbB1e6e5305550B";

    // Get bridge contract
    const bridgeArtifact = await hre.artifacts.readArtifact("contracts/SepoliaBridge.sol:SepoliaBridge");
    const bridgeFactory = new ContractFactory(bridgeArtifact.abi, bridgeArtifact.bytecode, deployer);
    const bridge = bridgeFactory.attach(bridgeAddress);

    console.log("Bridge Address:", bridgeAddress);
    console.log("");

    // Test bridge functions
    try {
        const bridgeBalance = await bridge.getBridgeBalance();
        const bridgeOwner = await bridge.owner();
        const sourceChain = await bridge.SOURCE_CHAIN();
        const targetChain = await bridge.TARGET_CHAIN();
        const paused = await bridge.paused();

        console.log("✅ Bridge Status:");
        console.log("   Balance:", formatEther(bridgeBalance), "BAZ");
        console.log("   Owner:", bridgeOwner);
        console.log("   Source Chain:", sourceChain);
        console.log("   Target Chain:", targetChain);
        console.log("   Paused:", paused);
        console.log("");

        // Test nonce functions
        const testNonce = 12345;
        const isProcessed = await bridge.isNonceProcessed(testNonce);
        console.log(`Nonce ${testNonce} processed:`, isProcessed);

        // Test user nonce
        const userNonce = await bridge.getUserNonce(deployer.address);
        console.log("User nonce:", userNonce.toString());
        console.log("");

        // Test a small unlock (this will fail but shows the function works)
        const testAmount = ethers.parseEther("1"); // 1 token
        console.log("Testing unlock with 1 token...");
        
        try {
            const unlockTx = await bridge.selfUnlockTokens(testAmount, testNonce);
            console.log("Unlock transaction sent:", unlockTx.hash);
            await unlockTx.wait();
            console.log("✅ Unlock successful!");
        } catch (error) {
            console.log("❌ Unlock failed (expected):", error.message);
        }

    } catch (error) {
        console.log("❌ Bridge Error:", error);
    }

    console.log("\n🎉 Manual Unlock Test Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
