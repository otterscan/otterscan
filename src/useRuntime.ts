import { JsonRpcApiProvider, JsonRpcProvider, Network } from "ethers";
import { createContext, useMemo } from "react";
import { ConnectionStatus } from "./types";
import { OtterscanConfig, useConfig } from "./useConfig";
import { useProvider } from "./useProvider";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { useZilliqa } from "./useZilliqa";

/**
 * A runtime comprises a OtterscanConfig read from somewhere, +
 * ETH provider + status object built from the config.
 */
export type OtterscanRuntime = {
  /**
   * Config object; may be null if it is still fetching.
   */
  config?: OtterscanConfig;

  /**
   * State machine for last known status of communication browse <-> node.
   */
  connStatus: ConnectionStatus;

  /**
   * ETH provider; may be undefined if not ready because of config fetching,
   * probing occurring, etc.
   */
  provider?: JsonRpcApiProvider;

  /**
    * Zilliqa object; may be undefined if not ready because of config fetching,
    * probing occurring, etc.
  */
  zilliqa?: Zilliqa;
};

export const useRuntime = (): OtterscanRuntime => {
  const config = useConfig();

  // TODO: fix internal hack
  const hardCodedConfig = useMemo(() => {
    if (import.meta.env.VITE_CONFIG_JSON === undefined) {
      return undefined;
    }

    console.log("Using hardcoded config: ");
    console.log(import.meta.env.VITE_CONFIG_JSON);
    return JSON.parse(import.meta.env.VITE_CONFIG_JSON);
  }, [import.meta.env.VITE_CONFIG_JSON]);

  const effectiveConfig = hardCodedConfig ?? config;

  const [connStatus, provider] = useProvider(
    effectiveConfig?.erigonURL,
    effectiveConfig?.experimentalFixedChainId,
  );

  const zilliqa = useZilliqa(effectiveConfig?.erigonURL);

  const runtime = useMemo((): OtterscanRuntime => {
    if (effectiveConfig === undefined) {
      return { connStatus: ConnectionStatus.CONNECTING };
    }

    // Hardcoded config
    if (effectiveConfig.experimentalFixedChainId !== undefined) {
      const network = Network.from(effectiveConfig.experimentalFixedChainId);
      return {
        config: effectiveConfig,
        connStatus: ConnectionStatus.CONNECTED,
        provider: new JsonRpcProvider(effectiveConfig.erigonURL, network, {
          staticNetwork: network,
        }),
        zilliqa : zilliqa,
      };
    }
    return { config: effectiveConfig, connStatus, provider, zilliqa };
  }, [effectiveConfig, connStatus, provider, zilliqa]);

  return runtime;
};

/**
 * App-level context holding the runtime data. Use it only once.
 */
export const RuntimeContext = createContext<OtterscanRuntime>(null!);
