import { createContext, useContext, useEffect, useState } from "react";
import { chainInfoURL } from "./url";
import { OtterscanRuntime } from "./useRuntime";

export type ChainInfo = {
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export const defaultChainInfo: ChainInfo = {
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
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
          nativeCurrency: {
            name: info.nativeCurrency.name,
            decimals: info.nativeCurrency.decimals,
            symbol: info.nativeCurrency.symbol,
          },
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
