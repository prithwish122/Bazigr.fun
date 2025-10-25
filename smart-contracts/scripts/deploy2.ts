import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory, formatEther } from "ethers";
import "dotenv/config";

async function main() {
    const rpcUrl = process.env.U2U_RPC_URL || "https://rpc-mainnet.u2u.xyz";
    const privateKey = (process.env.U2U_PRIVATE_KEY || "").startsWith("0x")
        ? (process.env.U2U_PRIVATE_KEY as string)
        : `0x${process.env.U2U_PRIVATE_KEY || ""}`;

    const provider = new JsonRpcProvider(rpcUrl);
    const deployer = new Wallet(privateKey, provider);

    console.log("Network:", "u2uMainnet");
    console.log("Deployer:", deployer.address);
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer balance:", formatEther(balance), "ETH");

    const artifact = await hre.artifacts.readArtifact("contracts/Plan.sol:PlanDao");
    const factory = new ContractFactory(artifact.abi, artifact.bytecode, deployer);

    const contract = await factory.deploy();
    const receipt = await contract.deploymentTransaction()?.wait();

    const address = await contract.getAddress();
    console.log("Bazigr deployed to:", address);
    if (receipt) {
        console.log("Deployment tx:", receipt.hash);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});