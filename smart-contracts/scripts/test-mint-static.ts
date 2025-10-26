import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import fs from "fs";

async function main() {
  console.log("🔍 Testing mint() with staticCall\n");

  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  const deployment = JSON.parse(fs.readFileSync("deployment-defi-fixed.json", "utf8"));
  const { BAZ_TOKEN, WCELO, BAZ_WCELO_PAIR } = deployment.contracts;

  // Load contracts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");

  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wceloToken = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(BAZ_WCELO_PAIR);

  const amount0 = parseEther("1");
  const amount1 = parseEther("100");

  console.log("Transferring tokens to pair...");
  const tx1 = await wceloToken.transfer(BAZ_WCELO_PAIR, amount0);
  await tx1.wait();
  console.log("✅ Transferred", formatEther(amount0), "WCELO");

  const tx2 = await bazToken.transfer(BAZ_WCELO_PAIR, amount1);
  await tx2.wait();
  console.log("✅ Transferred", formatEther(amount1), "BAZ\n");

  console.log("Attempting staticCall to mint()...");
  try {
    const result = await pair.mint.staticCall(deployer.address);
    console.log("✅ staticCall succeeded! Liquidity would be:", formatEther(result));
  } catch (error: any) {
    console.log("❌ staticCall failed!");
    console.log("Error:", error);
    
    if (error.data) {
      console.log("\nError data:", error.data);
      // Try to decode
      if (error.data.startsWith('0x08c379a0')) {
        // String error
        const reason = error.data.slice(10);
        console.log("Decoded reason:", Buffer.from(reason, 'hex').toString());
      }
    }
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
