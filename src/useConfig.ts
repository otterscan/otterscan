import { useEffect } from "react";
import useSWRImmutable from "swr/immutable";
import { CONFIG_PATH } from "./config";
import { jsonFetcherWithErrorHandling } from "./fetcher";

export type OtterscanConfig = {
  erigonURL?: string;
  beaconAPI?: string;
  assetsURLPrefix?: string;
};

export const useConfig = (): [boolean?, OtterscanConfig?] => {
  const { data } = useSWRImmutable(CONFIG_PATH, jsonFetcherWithErrorHandling);
  const configOK = data !== undefined;
  const config = data !== undefined ? (data as OtterscanConfig) : undefined;

  useEffect(() => {
    if (!configOK) {
      return;
    }
    console.info("Loaded app config");
    console.info(config);
  }, [config]);

  return [configOK, config];
};
