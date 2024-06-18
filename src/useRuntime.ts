import { JsonRpcApiProvider, JsonRpcProvider, Network } from "ethers";
import { createContext, useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { jsonFetcherWithErrorHandling } from "./fetcher";
import { ConnectionStatus } from "./types";
import { DEFAULT_CONFIG_FILE, OtterscanConfig } from "./useConfig";
import { useProvider } from "./useProvider";

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
};

export const useRuntime = (): OtterscanRuntime => {
  const configURL = DEFAULT_CONFIG_FILE;
  const { data } = useSWRImmutable(configURL, jsonFetcherWithErrorHandling);

  const config = useMemo(() => {
    if (data === undefined) {
      return undefined;
    }

    // Override config for local dev
    const _config: OtterscanConfig = { ...data };
    if (import.meta.env.DEV) {
      _config.erigonURL = import.meta.env.VITE_ERIGON_URL ?? _config.erigonURL;
      _config.beaconAPI =
        import.meta.env.VITE_BEACON_API_URL ?? _config.beaconAPI;
      _config.assetsURLPrefix =
        import.meta.env.VITE_ASSETS_URL ?? _config.assetsURLPrefix;
      _config.experimental =
        import.meta.env.VITE_EXPERIMENTAL ?? _config.experimental;
      if (import.meta.env.VITE_EXPERIMENTAL_FIXED_CHAIN_ID !== undefined) {
        _config.experimentalFixedChainId = parseInt(
          import.meta.env.VITE_EXPERIMENTAL_FIXED_CHAIN_ID,
        );
      }
    }
    console.info("Loaded app config");
    console.info(_config);
    return _config;
  }, [data]);

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
      };
    }
    return { config: effectiveConfig, connStatus, provider };
  }, [effectiveConfig, connStatus, provider]);

  return runtime;
};

/**
 * App-level context holding the runtime data. Use it only once.
 */
export const RuntimeContext = createContext<OtterscanRuntime>(null!);
