import React from "react";
import { ethers } from "ethers";
import { useErigon } from "./useErigon";

export const DEFAULT_ERIGON_URL = "http://127.0.0.1:8545";

export const useProvider = (): ethers.providers.JsonRpcProvider | undefined => {
  const [configOK, config] = useErigon();
  if (!configOK) {
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

export const ProviderContext = React.createContext<
  ethers.providers.JsonRpcProvider | undefined
>(undefined);
