import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";
import fs from "fs";

/**
 * Test the fixed pair directly by transferring and minting
 */
async function main() {
  console.log("🧪 Testing Fixed Pair Contract\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Account:", deployer.address, "\n");

  // Load deployment
  const deployment = JSON.parse(fs.readFileSync("deployment-defi-fixed.json", "utf8"));
  const { BAZ_TOKEN, WCELO, BAZ_WCELO_PAIR } = deployment.contracts;

  // Load contracts
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");

  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wceloToken = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(BAZ_WCELO_PAIR);

  // Check pair initialization
  console.log("Checking pair status...");
  const token0 = await pair.token0();
  const token1 = await pair.token1();
  console.log("✓ Token0:", token0);
  console.log("✓ Token1:", token1);
  console.log("\n");

  // Initial reserves
  const initialReserves = await pair.getReserves();
  console.log("Initial reserves:");
  console.log("  Reserve0:", formatEther(initialReserves[0]));
  console.log("  Reserve1:", formatEther(initialReserves[1]));
  console.log("\n");

  // Define amounts - smaller for testing
  const BAZ_AMOUNT = parseEther("100");   // 100 BAZ
  const WCELO_AMOUNT = parseEther("1");   // 1 WCELO

  const isBazToken0 = token0.toLowerCase() === BAZ_TOKEN.toLowerCase();
  const amount0 = isBazToken0 ? BAZ_AMOUNT : WCELO_AMOUNT;
  const amount1 = isBazToken0 ? WCELO_AMOUNT : BAZ_AMOUNT;

  console.log("Adding liquidity:");
  console.log("  BAZ:  ", formatEther(BAZ_AMOUNT));
  console.log("  WCELO:", formatEther(WCELO_AMOUNT));
  console.log("  Token order:", isBazToken0 ? "BAZ/WCELO" : "WCELO/BAZ");
  console.log("\n");

  // Step 1: Transfer token0 to pair
  console.log("Step 1: Transferring", formatEther(amount0), isBazToken0 ? "BAZ" : "WCELO", "to pair...");
  const tx1 = isBazToken0 
    ? await bazToken.transfer(BAZ_WCELO_PAIR, amount0)
    : await wceloToken.transfer(BAZ_WCELO_PAIR, amount0);
  await tx1.wait();
  console.log("✅ Done\n");

  // Step 2: Transfer token1 to pair
  console.log("Step 2: Transferring", formatEther(amount1), isBazToken0 ? "WCELO" : "BAZ", "to pair...");
  const tx2 = isBazToken0
    ? await wceloToken.transfer(BAZ_WCELO_PAIR, amount1)
    : await bazToken.transfer(BAZ_WCELO_PAIR, amount1);
  await tx2.wait();
  console.log("✅ Done\n");

  // Check balances before mint
  const pairBaz = await bazToken.balanceOf(BAZ_WCELO_PAIR);
  const pairWcelo = await wceloToken.balanceOf(BAZ_WCELO_PAIR);
  console.log("Pair balances before mint:");
  console.log("  BAZ:  ", formatEther(pairBaz));
  console.log("  WCELO:", formatEther(pairWcelo));
  console.log("\n");

  // Step 3: Call mint
  console.log("Step 3: Calling mint...");
  try {
    const mintTx = await pair.mint(deployer.address, { gasLimit: 300000 });
    const receipt = await mintTx.wait();
    console.log("✅ Mint successful!");
    console.log("   TX:", receipt.hash);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("\n");

    // Check results
    const reserves = await pair.getReserves();
    const totalSupply = await pair.totalSupply();
    const lpBalance = await pair.balanceOf(deployer.address);

    console.log("=" .repeat(70));
    console.log("RESULTS");
    console.log("=" .repeat(70));
    console.log("\nReserves:");
    console.log("  Reserve0:", formatEther(reserves[0]));
    console.log("  Reserve1:", formatEther(reserves[1]));
    console.log("  BAZ:     ", formatEther(isBazToken0 ? reserves[0] : reserves[1]));
    console.log("  WCELO:   ", formatEther(isBazToken0 ? reserves[1] : reserves[0]));
    console.log("\nLP Tokens:");
    console.log("  Total Supply:", formatEther(totalSupply));
    console.log("  Your Balance:", formatEther(lpBalance));
    console.log("\n");

    console.log("✅ SUCCESS! Pool is working correctly!");

  } catch (error: any) {
    console.log("❌ Mint failed:", error.message);
    if (error.data) {
      console.log("   Revert data:", error.data);
    }
    
    // Try to decode the error
    if (error.receipt) {
      console.log("   Receipt status:", error.receipt.status);
      console.log("   Gas used:", error.receipt.gasUsed?.toString());
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
