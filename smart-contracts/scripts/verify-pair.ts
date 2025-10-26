import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import fs from "fs";

async function main() {
  console.log("🔍 Verifying Pair Contract\n");

  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  const deployment = JSON.parse(fs.readFileSync("deployment-defi-fixed.json", "utf8"));
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(deployment.contracts.BAZ_WCELO_PAIR);

  console.log("Pair address:", deployment.contracts.BAZ_WCELO_PAIR);
  console.log("\nCalling view functions...");
  
  try {
    const name = await pair.name();
    console.log("✅ name():", name);
    
    const symbol = await pair.symbol();
    console.log("✅ symbol():", symbol);
    
    const totalSupply = await pair.totalSupply();
    console.log("✅ totalSupply():", totalSupply.toString());
    
    const token0 = await pair.token0();
    console.log("✅ token0():", token0);
    
    const token1 = await pair.token1();
    console.log("✅ token1():", token1);
    
    const factory = await pair.factory();
    console.log("✅ factory():", factory);
    
    const reserves = await pair.getReserves();
    console.log("✅ getReserves():", reserves[0].toString(), reserves[1].toString());
    
    console.log("\n✅ All view functions work! Contract is deployed correctly.");
    console.log("\n🔍 The issue must be in the mint() function logic or modifiers.");
    
  } catch (error: any) {
    console.log("❌ Error calling view functions:", error.message);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
