import { useState, useEffect } from "react";

export type OtterscanConfig = {
  erigonURL: string;
  assetsURLPrefix: string;
};

export const useConfig = (): [boolean?, OtterscanConfig?] => {
  const [configOK, setConfigOK] = useState<boolean>();
  const [config, setConfig] = useState<OtterscanConfig>();

  useEffect(() => {
    const readConfig = async () => {
      const res = await fetch("/config.json");

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
