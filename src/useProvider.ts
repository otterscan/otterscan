import { useMemo } from "react";
import { ethers } from "ethers";

export const DEFAULT_ERIGON_URL = "http://127.0.0.1:8545";

export const useProvider = (
  erigonURL?: string
): ethers.providers.JsonRpcProvider | undefined => {
  if (erigonURL === "") {
    console.info(`Using default erigon URL: ${DEFAULT_ERIGON_URL}`);
    erigonURL = DEFAULT_ERIGON_URL;
  } else {
    console.log(`Using configured erigon URL: ${erigonURL}`);
  }

  const provider = useMemo(
    () => new ethers.providers.JsonRpcProvider(erigonURL, "mainnet"),
    [erigonURL]
  );
  if (!erigonURL) {
    return undefined;
  }
  return provider;
};
