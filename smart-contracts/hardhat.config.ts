import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";
import "dotenv/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
          evmVersion: "paris",
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "paris",
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: "https://sepolia.infura.io/v3/" + configVariable("INFURA_API_KEY"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    u2uMainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("U2U_RPC_URL"),
      accounts: [configVariable("U2U_PRIVATE_KEY")],
    },
    celoSepolia: {
      type: "http",
      chainType: "l1",
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: ["9d0b6c976265af1f174e94e651c1e36f020958367997c7e4afc195adb22ed9e3"],
      chainId: 11142220,
    },
  },
};

export default config;