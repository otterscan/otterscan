import React from "react";
import { ethers } from "ethers";
import { OtterscanConfig, useConfig } from "./useConfig";
import { useProvider } from "./useProvider";

export type OtterscanRuntime = {
  config?: OtterscanConfig;
  provider?: ethers.providers.JsonRpcProvider;
};

export const useRuntime = (): OtterscanRuntime => {
  const [configOK, config] = useConfig();
  const provider = useProvider(config);

  if (!configOK) {
    return {};
  }

  return { config, provider };
};

export const RuntimeContext = React.createContext<OtterscanRuntime>(null!);
