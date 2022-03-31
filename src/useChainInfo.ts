import { createContext, useContext, useEffect, useState } from "react";
import { chainInfoURL } from "./url";
import { OtterscanRuntime } from "./useRuntime";

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

export const useChainInfoFromMetadataFile = (
  runtime: OtterscanRuntime | undefined
): ChainInfo | undefined => {
  const assetsURLPrefix = runtime?.config?.assetsURLPrefix;
  const chainId = runtime?.provider?.network.chainId;

  const [chainInfo, setChainInfo] = useState<ChainInfo | undefined>(undefined);

  useEffect(() => {
    if (assetsURLPrefix === undefined || chainId === undefined) {
      setChainInfo(undefined);
      return;
    }

    const readChainInfo = async () => {
      try {
        const res = await fetch(chainInfoURL(assetsURLPrefix, chainId));
        if (!res.ok) {
          setChainInfo(defaultChainInfo);
          return;
        }
        const info = await res.json();

        setChainInfo({
          nativeName: info.nativeCurrency.name,
          nativeDecimals: info.nativeCurrency.decimals,
          nativeSymbol: info.nativeCurrency.symbol,
        });
      } catch (err) {
        // ignore
        setChainInfo(defaultChainInfo);
        return;
      }
    };
    readChainInfo();
  }, [assetsURLPrefix, chainId]);

  return chainInfo;
};

export const useChainInfo = (): ChainInfo => {
  const chainInfo = useContext(ChainInfoContext);
  if (chainInfo === undefined) {
    throw new Error("no chain info");
  }
  return chainInfo;
};
