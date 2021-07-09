import { ethers } from "ethers";
import { OtterscanConfig } from "./useConfig";

export const DEFAULT_ERIGON_URL = "http://127.0.0.1:8545";

export const useProvider = (
  config?: OtterscanConfig
): ethers.providers.JsonRpcProvider | undefined => {
  if (!config) {
    return undefined;
  }

  let erigonURL = config?.erigonURL;
  if (erigonURL === "") {
    console.info(`Using default erigon URL: ${DEFAULT_ERIGON_URL}`);
    erigonURL = DEFAULT_ERIGON_URL;
  } else {
    console.log(`Using configured erigon URL: ${erigonURL}`);
  }

  return new ethers.providers.JsonRpcProvider(erigonURL, "mainnet");
};
