import { useEffect, useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { CONFIG_PATH } from "./config";
import { jsonFetcherWithErrorHandling } from "./fetcher";

export type OtterscanConfig = {
  erigonURL?: string;
  beaconAPI?: string;
  assetsURLPrefix?: string;
};

export const useConfig = (): OtterscanConfig | undefined => {
  const { data } = useSWRImmutable(CONFIG_PATH, jsonFetcherWithErrorHandling);
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
