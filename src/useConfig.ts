import { useEffect } from "react";
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
  const config = data !== undefined ? (data as OtterscanConfig) : undefined;

  useEffect(() => {
    if (data === undefined) {
      return;
    }
    console.info("Loaded app config");
    console.info(config);
  }, [config]);

  return config;
};
