import { HardhatUserConfig } from "hardhat/config";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "hardhat-deploy";

const config: HardhatUserConfig = {
  zksolc: {
    version: "1.4.0",
    compilerSource: "binary",
    settings: {
      enableEraVMExtensions: false,
      forceEVMLA: false,
    },
  },
  defaultNetwork: "zkSyncSepolia",
  networks: {
    zkSyncSepolia: {
      url: process.env.XSOLLA_ZK_SEPOLIA_RPC || "",
      ethNetwork: "sepolia",
      zksync: true,
      chainId: 300,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
