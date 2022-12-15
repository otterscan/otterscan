import { useState, useEffect } from "react";
import { CONFIG_PATH } from "./config";

export type OtterscanConfig = {
  erigonURL?: string;
  beaconAPI?: string;
  assetsURLPrefix?: string;
};

export const useConfig = (): [boolean?, OtterscanConfig?] => {
  const [configOK, setConfigOK] = useState<boolean>();
  const [config, setConfig] = useState<OtterscanConfig>();

  useEffect(() => {
    const readConfig = async () => {
      const res = await fetch(CONFIG_PATH);

      if (res.ok) {
        const _config: OtterscanConfig = await res.json();
        console.info("Loaded app config");
        console.info(_config);
        setConfig(_config);
        setConfigOK(res.ok);
      }
    };
    readConfig();
  }, []);

  return [configOK, config];
};
