import { createContext, useContext } from "react";

export type ChainInfo = {
  nativeName: string;
  nativeSymbol: string;
  nativeDecimals: number;
};

export const defaultChainInfo: ChainInfo = {
  nativeName: "Ether",
  nativeSymbol: "ETH",
  nativeDecimals: 18,
};

export const ChainInfoContext = createContext<ChainInfo | undefined>(undefined);

export const useChainInfo = (): ChainInfo => {
  const chainInfo = useContext(ChainInfoContext);
  if (chainInfo === undefined) {
    throw new Error("no chain info");
  }
  return chainInfo;
};
