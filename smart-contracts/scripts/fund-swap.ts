import hre from "hardhat";
import { JsonRpcProvider, Wallet, Contract, formatEther, parseEther } from "ethers";
import "dotenv/config";

const erc20Abi = [
  "function mint(address to, uint256 amount) external",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const rpcUrl = process.env.U2U_RPC_URL || "https://rpc-mainnet.u2u.xyz";
  const privateKey = (process.env.U2U_PRIVATE_KEY || "").startsWith("0x")
    ? (process.env.U2U_PRIVATE_KEY as string)
    : `0x${process.env.U2U_PRIVATE_KEY || ""}`;

  const bazToken = process.env.BAZ_TOKEN_ADDRESS || "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80";
  const swapAddress = process.env.SWAP_ADDRESS || "0xE396AeD3086E2Fd5B8Bc1f1622AD298A396A4470";

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  console.log("Funding from:", wallet.address);
  const bal = await provider.getBalance(wallet.address);
  console.log("Native balance:", formatEther(bal), "U2U");

  // 1) Send 10 U2U native to swap
  console.log("Sending 10 U2U to swap:", swapAddress);
  const tx1 = await wallet.sendTransaction({ to: swapAddress, value: parseEther("10") });
  await tx1.wait();
  console.log("Native sent. Tx:", tx1.hash);

  // 2) Mint 200 BAZ to swap (Bazigr.mint multiplies by 1e18 internally)
  const token = new Contract(bazToken, erc20Abi, wallet);
  console.log("Minting 200 BAZ to swap via Bazigr.mint:", bazToken);
  const tx2 = await token.mint(swapAddress, 200);
  await tx2.wait();
  console.log("BAZ minted. Tx:", tx2.hash);

  const bazBal = await token.balanceOf(swapAddress);
  console.log("Swap BAZ balance:", bazBal.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


