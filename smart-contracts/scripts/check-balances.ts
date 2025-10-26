import hre from "hardhat";
import { JsonRpcProvider, Wallet, formatEther, Contract } from "ethers";
import fs from "fs";

async function main() {
  console.log("\n💰 Checking Balances\n");
  
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

  // Get contracts
  const WCELO_ABI = await hre.artifacts.readArtifact("WCELO");
  const BAZ_ABI = await hre.artifacts.readArtifact("BZGToken");
  
  const wcelo = new Contract(deployment.contracts.WCELO, WCELO_ABI.abi, deployer);
  const baz = new Contract(deployment.contracts.BAZ_TOKEN, BAZ_ABI.abi, deployer);

  // Check balances
  const wceloBalance = await wcelo.balanceOf(deployer.address);
  const bazBalance = await baz.balanceOf(deployer.address);
  const celoBalance = await provider.getBalance(deployer.address);

  console.log("\n📊 Balances:");
  console.log("  CELO:  ", formatEther(celoBalance));
  console.log("  WCELO: ", formatEther(wceloBalance));
  console.log("  BAZ:   ", formatEther(bazBalance));

  console.log("\n💡 Wrap CELO to WCELO if needed:");
  console.log("  const wcelo = await ethers.getContractAt('WCELO', '" + deployment.contracts.WCELO + "');");
  console.log("  await wcelo.deposit({ value: ethers.parseEther('10') });");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
