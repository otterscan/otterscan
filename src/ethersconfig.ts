import { ethers } from "ethers";

export const ERIGON_NODE =
  process.env.REACT_APP_ERIGON_URL || "http://127.0.0.1:8545";

export const provider = new ethers.providers.JsonRpcProvider(
  ERIGON_NODE,
  "mainnet"
);
