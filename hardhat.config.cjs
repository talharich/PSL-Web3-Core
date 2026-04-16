require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    wirefluid: {
      url: process.env.WIREFLUID_RPC_URL || 'https://evm.wirefluid.com',
      chainId: Number(process.env.WIREFLUID_CHAIN_ID) || 92533,
      // This logic ensures it uses the .env key if available, 
      // or falls back to your hardcoded string correctly formatted.
      accounts: process.env.PRIVATE_KEY 
        ? [process.env.PRIVATE_KEY] 
        : ["0xfc4cd53731366848d69502e6569e806bfb51ac7dcabd8f0a273ab7a7c89e6024"],
    },
  },
  etherscan: {
    apiKey: {
      wirefluid: process.env.WIRESCAN_API_KEY ?? "placeholder",
    },
    customChains: [
      {
        network: "wirefluid",
        chainId: Number(process.env.WIREFLUID_CHAIN_ID),
        urls: {
          apiURL: "https://wirefluidscan.com/api",        // ← confirm this with WireScan docs
          browserURL: "https://wirefluidscan.com",
        },
      },
    ],
  },
};