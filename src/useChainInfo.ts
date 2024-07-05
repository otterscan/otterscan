import { createContext, useContext } from "react";
import { chainInfoURL } from "./url";
import { ChainInfo, defaultChainInfo } from "./useConfig";
import { OtterscanRuntime } from "./useRuntime";

export const populateChainInfo = async (
  rtPromise: Promise<OtterscanRuntime>,
): Promise<OtterscanRuntime> => {
  const runtime = await rtPromise;

  // Hardcoded chainInfo; DON'T fetch it
  const hardcodedChainInfo = runtime.config.chainInfo !== undefined;
  if (hardcodedChainInfo) {
    return rtPromise;
  }

  // TODO: check the assertions
  const assetsURLPrefix = runtime.config.assetsURLPrefix!;
  const network = await runtime.provider.getNetwork();
  const chainId = network.chainId;

  const url = chainInfoURL(assetsURLPrefix, chainId);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      runtime.config!.chainInfo = defaultChainInfo;
      return Promise.resolve(runtime);
    }

    const info: ChainInfo = await res.json();
    runtime.config!.chainInfo = info;
    return Promise.resolve(runtime);
  } catch (err) {
    runtime.config!.chainInfo = defaultChainInfo;
    return Promise.resolve(runtime);
  }
};

export const ChainInfoContext = createContext<ChainInfo | undefined>(undefined);

export const useChainInfo = (): ChainInfo => {
  const chainInfo = useContext(ChainInfoContext);
  if (chainInfo === undefined) {
    throw new Error("no chain info");
  }
  return chainInfo;
};
