import { useEffect, useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { jsonFetcherWithErrorHandling } from "./fetcher";

/**
 * Defines a set of metadata for a certain chain.
 *
 * Users may define where it comes from, but it usually will come
 * from config file or read from chainlist directory.
 */
export type ChainInfo = {
  /**
   * Full name of the chain.
   */
  name: string;

  /**
   * If this is a testnet, list example faucets; used by a certain part of
   * ots UI.
   */
  faucets: string[];

  /**
   * Describe the chain native token, e.g., mainnet is ETH, polygon is MATIC.
   */
  nativeCurrency: {
    /**
     * The full native token name, e.g. "Ether"
     */
    name: string;

    /**
     * The native token symbol, e.g. "ETH"
     */
    symbol: string;

    /**
     * The native token number of decimals, e.g. mainnet == 18.
     */
    decimals: number;
  };
};

export const defaultChainInfo: ChainInfo = {
  name: "",
  faucets: [],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
};

/**
 * This is a 1:1 mapping to public/config.json file which is fetched on
 * page load.
 */
export type OtterscanConfig = {
  /**
   * URL for Erigon JSON-RPC endpoint.
   */
  erigonURL?: string;

  /**
   * (optional) URL for Beacon chain REST API (for merged chains)
   */
  beaconAPI?: string;

  /**
   * URL for static assets (logos, 4bytes, topic0, etc.)
   */
  assetsURLPrefix?: string;

  /**
   * Enable experimental features (possibly still undocumented)
   */
  experimental?: boolean;

  /**
   * Hardcode a chain ID here, avoiding having to probe the ETH provider
   * for it, saving network calls.
   */
  experimentalFixedChainId?: number;

  /**
   * Optional info about the chain; it may be predefined from config.json,
   * but also it can omitted, in which can it should be auto detected from
   * provider network + fetching the chain metadata file (in this case
   * there is an initial network hop + repaint).
   *
   * Hosted instances will probably want to hardcode the chain info during
   * initialization.
   */
  chainInfo?: ChainInfo;

  /**
   * Optional site customization options
   */
  branding?: {
    /**
     * Site name shown in page titles, home, and header
     */
    siteName: string;
  };
};

/**
 * Default location for fetching the config file.
 */
export const DEFAULT_CONFIG_FILE = "/config.json";

/**
 * Fetches the config file and parse it into proper config object.
 *
 * On development environment, allows the config to be set by overriding
 * specific params over the default "/public/config.json" by using Vite's
 * env mechanism: https://vitejs.dev/guide/env-and-mode.html
 */
export const useConfig = (
  configURL: string = DEFAULT_CONFIG_FILE
): OtterscanConfig | undefined => {
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
          import.meta.env.VITE_EXPERIMENTAL_FIXED_CHAIN_ID
        );
      }
    }
    return _config;
  }, [data]);

  useEffect(() => {
    if (data === undefined) {
      return;
    }
    console.info("Loaded app config");
    console.info(config);
  }, [config]);

  return config;
};
