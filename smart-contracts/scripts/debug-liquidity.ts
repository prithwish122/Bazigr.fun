import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, parseEther, formatEther } from "ethers";
import "dotenv/config";

/**
 * Debug why liquidity addition is failing
 */
async function main() {
  console.log("🔍 Debugging Liquidity Addition Issue\n");

  // Setup
  const rpcUrl = "https://forno.celo-sepolia.celo-testnet.org/";
  const privateKey = "9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3";
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("📍 Account:", deployer.address, "\n");

  // Contract addresses
  const BAZ_TOKEN = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
  const WCELO = "0x8C3EBc355cC768dD1e9BaFc085B1f0Cb728C7FcF";
  const FACTORY = "0xf29E685888FbF4f5AADbA8a3dF2499EfF6BFfE1C";
  const ROUTER = "0xb15B6512458BF9c4e9D92EE6951201E1B5d6F1A1";
  const PAIR = "0x8e31cdebcDF628aCecf5e4EDAB0A25a9B7a75e14";

  // Load contracts
  const factoryArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Factory.sol:UniswapV2Factory");
  const pairArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Pair.sol:UniswapV2Pair");
  const bazArtifact = await hre.artifacts.readArtifact("contracts/Bazigar.sol:Bazigr");
  const wceloArtifact = await hre.artifacts.readArtifact("contracts/WCELO.sol:WCELO");

  const factory = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, deployer).attach(FACTORY);
  const pair = new ContractFactory(pairArtifact.abi, pairArtifact.bytecode, deployer).attach(PAIR);
  const bazToken = new ContractFactory(bazArtifact.abi, bazArtifact.bytecode, deployer).attach(BAZ_TOKEN);
  const wceloToken = new ContractFactory(wceloArtifact.abi, wceloArtifact.bytecode, deployer).attach(WCELO);

  console.log("=" .repeat(70));
  console.log("CHECKING PAIR STATUS");
  console.log("=" .repeat(70));

  // Check if pair exists
  const pairAddress = await factory.getPair(BAZ_TOKEN, WCELO);
  console.log("\n✓ Pair from factory:  ", pairAddress);
  console.log("✓ Expected pair:      ", PAIR);
  console.log("✓ Pair exists:        ", pairAddress.toLowerCase() === PAIR.toLowerCase());

  // Check pair token addresses
  try {
    const token0 = await pair.token0();
    const token1 = await pair.token1();
    console.log("\n✓ Pair token0:        ", token0);
    console.log("✓ Pair token1:        ", token1);
    
    const isBazToken0 = token0.toLowerCase() === BAZ_TOKEN.toLowerCase();
    console.log("✓ BAZ is token0:      ", isBazToken0);
    console.log("✓ Token order:        ", isBazToken0 ? "BAZ/WCELO" : "WCELO/BAZ");
  } catch (error: any) {
    console.log("\n❌ Failed to read pair tokens:", error.message);
    console.log("   This suggests the pair is not initialized!");
    return;
  }

  // Check reserves
  try {
    const reserves = await pair.getReserves();
    console.log("\n✓ Reserve0:           ", formatEther(reserves[0]));
    console.log("✓ Reserve1:           ", formatEther(reserves[1]));
    console.log("✓ Total liquidity:    ", formatEther(await pair.totalSupply()));
  } catch (error: any) {
    console.log("\n❌ Failed to read reserves:", error.message);
  }

  // Check allowances
  console.log("\n" + "=" .repeat(70));
  console.log("CHECKING ALLOWANCES");
  console.log("=" .repeat(70));

  const bazAllowance = await bazToken.allowance(deployer.address, ROUTER);
  const wceloAllowance = await wceloToken.allowance(deployer.address, ROUTER);
  
  console.log("\n✓ BAZ allowance:      ", formatEther(bazAllowance));
  console.log("✓ WCELO allowance:    ", formatEther(wceloAllowance));

  // Check balances
  console.log("\n" + "=" .repeat(70));
  console.log("CHECKING BALANCES");
  console.log("=" .repeat(70));

  const bazBalance = await bazToken.balanceOf(deployer.address);
  const wceloBalance = await wceloToken.balanceOf(deployer.address);
  const pairBazBalance = await bazToken.balanceOf(PAIR);
  const pairWceloBalance = await wceloToken.balanceOf(PAIR);
  
  console.log("\n✓ Your BAZ:           ", formatEther(bazBalance));
  console.log("✓ Your WCELO:         ", formatEther(wceloBalance));
  console.log("✓ Pair's BAZ:         ", formatEther(pairBazBalance));
  console.log("✓ Pair's WCELO:       ", formatEther(pairWceloBalance));

  // Check router
  console.log("\n" + "=" .repeat(70));
  console.log("CHECKING ROUTER");
  console.log("=" .repeat(70));

  const routerArtifact = await hre.artifacts.readArtifact("contracts/UniswapV2Router.sol:UniswapV2Router");
  const router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, deployer).attach(ROUTER);

  const routerFactory = await router.factory();
  const routerWCELO = await router.WCELO();

  console.log("\n✓ Router factory:     ", routerFactory);
  console.log("✓ Expected factory:   ", FACTORY);
  console.log("✓ Router WCELO:       ", routerWCELO);
  console.log("✓ Expected WCELO:     ", WCELO);

  // Try to simulate addLiquidity locally
  console.log("\n" + "=" .repeat(70));
  console.log("ATTEMPTING MANUAL TRANSFER TEST");
  console.log("=" .repeat(70));

  try {
    // Small test amount
    const testAmount = parseEther("1");
    
    console.log("\n📝 Transferring", formatEther(testAmount), "BAZ to pair...");
    const tx1 = await bazToken.transfer(PAIR, testAmount);
    await tx1.wait();
    console.log("✅ Transfer successful");

    console.log("\n📝 Transferring", formatEther(parseEther("0.005")), "WCELO to pair...");
    const tx2 = await wceloToken.transfer(PAIR, parseEther("0.005"));
    await tx2.wait();
    console.log("✅ Transfer successful");

    // Try to mint
    console.log("\n📝 Calling pair.mint()...");
    const mintTx = await pair.mint(deployer.address, { gasLimit: 300000 });
    await mintTx.wait();
    console.log("✅ Mint successful!");

    // Check new reserves
    const newReserves = await pair.getReserves();
    console.log("\n✓ New Reserve0:       ", formatEther(newReserves[0]));
    console.log("✓ New Reserve1:       ", formatEther(newReserves[1]));
    console.log("✓ New Total Supply:   ", formatEther(await pair.totalSupply()));
    console.log("✓ Your LP Balance:    ", formatEther(await pair.balanceOf(deployer.address)));

    console.log("\n✅ SUCCESS! Pair is working. Issue is with Router.");
    console.log("   Suggestion: Check Router's addLiquidity implementation");

  } catch (error: any) {
    console.log("\n❌ Manual test failed:", error.message);
    if (error.data) {
      console.log("   Revert data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
