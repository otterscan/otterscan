import { createContext, useContext } from "react";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { chainInfoURL } from "./url";
import { ChainInfo, defaultChainInfo } from "./useConfig";
import { OtterscanRuntime } from "./useRuntime";

export const ChainInfoContext = createContext<ChainInfo | undefined>(undefined);

const chainInfoFetcher: (
  runtime: OtterscanRuntime | undefined,
) => Fetcher<ChainInfo, [string, bigint]> =
  (runtime) =>
  async ([assetsURLPrefix, chainId]) => {
    // Hardcoded chainInfo; DON'T fetch it
    if (runtime?.config?.chainInfo !== undefined) {
      return runtime.config.chainInfo;
    }

    const url = chainInfoURL(assetsURLPrefix, chainId);
    const res = await fetch(url);
    if (!res.ok) {
      return defaultChainInfo;
    }

    const info: ChainInfo = await res.json();
    return info;
  };

export const useChainInfoFromMetadataFile = (
  runtime: OtterscanRuntime | undefined,
): ChainInfo | undefined => {
  const hardcodedChainInfo = runtime?.config?.chainInfo !== undefined;
  const assetsURLPrefix = runtime?.config?.assetsURLPrefix;
  const chainId = runtime?.provider?._network?.chainId;

  const { data, error } = useSWRImmutable(
    !hardcodedChainInfo &&
      (assetsURLPrefix === undefined || chainId === undefined)
      ? null
      : [assetsURLPrefix, chainId],
    hardcodedChainInfo
      ? () => runtime?.config?.chainInfo
      : chainInfoFetcher(runtime),
  );
  if (error) {
    return defaultChainInfo;
  }
  return data;
};

export const useChainInfo = (): ChainInfo => {
  const chainInfo = useContext(ChainInfoContext);
  if (chainInfo === undefined) {
    throw new Error("no chain info");
  }
  return chainInfo;
};
