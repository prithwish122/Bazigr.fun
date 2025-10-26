import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import fs from "fs";

async function main() {
  console.log("\n📊 CHECKING POOL STATUS\n");

  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  const deployment = JSON.parse(fs.readFileSync("deployment-defi-fixed.json", "utf8"));
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(deployment.contracts.BAZ_WCELO_PAIR);

  console.log("Pair Address:", deployment.contracts.BAZ_WCELO_PAIR);
  
  const reserves = await pair.getReserves();
  const totalSupply = await pair.totalSupply();
  const lpBalance = await pair.balanceOf(deployer.address);
  
  console.log("\n📊 Pool Status:");
  console.log("  Reserve0 (WCELO):", formatEther(reserves[0]), "WCELO");
  console.log("  Reserve1 (BAZ):  ", formatEther(reserves[1]), "BAZ");
  console.log("  Total LP Supply: ", formatEther(totalSupply));
  console.log("  Your LP Balance: ", formatEther(lpBalance));
  console.log("");
  
  if (reserves[0] > 0 && reserves[1] > 0) {
    const ratio = Number(reserves[1]) / Number(reserves[0]);
    console.log("✅ POOL IS ACTIVE!");
    console.log("   Price: 1 WCELO =", (ratio / 1e18).toFixed(2), "BAZ");
  } else {
    console.log("⚠️  Pool is empty - need to add liquidity");
  }
}

main().then(() => process.exit(0)).catch(console.error);
