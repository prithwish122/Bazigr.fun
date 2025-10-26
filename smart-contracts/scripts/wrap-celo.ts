import hre from "hardhat";
import { JsonRpcProvider, Wallet, formatEther, Contract, parseEther } from "ethers";
import fs from "fs";

async function main() {
  console.log("\n💧 Wrapping CELO to WCELO\n");
  
  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);
  
  console.log("📍 Account:", deployer.address);
  
  // Load deployment addresses
  const deployment = JSON.parse(
    fs.readFileSync("deployment-defi-fixed.json", "utf8")
  );

  // Get WCELO contract
  const WCELO_ABI = await hre.artifacts.readArtifact("WCELO");
  const wcelo = new Contract(deployment.contracts.WCELO, WCELO_ABI.abi, deployer);

  // Check current balances
  const celoBalance = await provider.getBalance(deployer.address);
  const wceloBalanceBefore = await wcelo.balanceOf(deployer.address);

  console.log("\n📊 Before:");
  console.log("  CELO:  ", formatEther(celoBalance));
  console.log("  WCELO: ", formatEther(wceloBalanceBefore));

  // Wrap 1.5 CELO to WCELO (enough for liquidity + buffer)
  const amountToWrap = parseEther("1.5");
  console.log("\n💧 Wrapping", formatEther(amountToWrap), "CELO...");

  const tx = await wcelo.deposit({ value: amountToWrap, gasLimit: 100000 });
  console.log("⏳ Transaction hash:", tx.hash);
  await tx.wait();
  console.log("✅ CELO wrapped successfully!");

  // Check balances after
  const celoBalanceAfter = await provider.getBalance(deployer.address);
  const wceloBalanceAfter = await wcelo.balanceOf(deployer.address);

  console.log("\n📊 After:");
  console.log("  CELO:  ", formatEther(celoBalanceAfter));
  console.log("  WCELO: ", formatEther(wceloBalanceAfter));
  
  console.log("\n✅ Wrapped", formatEther(amountToWrap), "CELO to WCELO");
  console.log("📈 WCELO increased by:", formatEther(wceloBalanceAfter - wceloBalanceBefore));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
