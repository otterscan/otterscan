import { useState, useEffect } from "react";

export type OtterscanConfig = {
  erigonURL: string;
};

export const useConfig = (): [boolean?, OtterscanConfig?] => {
  const [configOK, setConfigOK] = useState<boolean>();
  const [config, setConfig] = useState<OtterscanConfig>();

  useEffect(() => {
    const readConfig = async () => {
      const res = await fetch("/config.json");

      if (res.ok) {
        const _config: OtterscanConfig = await res.json();
        setConfig(_config);
        setConfigOK(res.ok);
      }
    };
    readConfig();
  }, []);

  return [configOK, config];
};
