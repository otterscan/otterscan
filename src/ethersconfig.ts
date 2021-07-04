import { ethers } from "ethers";

export const ERIGON_NODE = "http://127.0.0.1:8545";

export const provider = new ethers.providers.JsonRpcProvider(
  ERIGON_NODE,
  "mainnet"
);
