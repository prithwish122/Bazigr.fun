import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import "dotenv/config";

async function main() {
  const rpcUrl = process.env.U2U_RPC_URL || "https://rpc-mainnet.u2u.xyz";
  console.log(process.env.U2U_RPC_URL,"====================================");
  const privateKey = (process.env.U2U_PRIVATE_KEY || "").startsWith("0x")
    ? (process.env.U2U_PRIVATE_KEY as string)
    : `0x${process.env.U2U_PRIVATE_KEY || ""}`;
  const bazToken = process.env.BAZ_TOKEN_ADDRESS || "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";

  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);

  console.log("Network:", "u2uMainnet");
  console.log("Deployer:", deployer.address);
  console.log("BAZ token:", bazToken);

  const artifact = await hre.artifacts.readArtifact("contracts/Swap.sol:FixedRateSwap");
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const contract = await factory.deploy(bazToken, deployer.address);
  const receipt = await contract.deploymentTransaction()?.wait();
  const address = await contract.getAddress();
  console.log("FixedRateSwap deployed to:", address);
  if (receipt) console.log("Deployment tx:", receipt.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
