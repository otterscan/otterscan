import React, { useMemo } from "react";
import { ethers } from "ethers";
import { OtterscanConfig, useConfig } from "./useConfig";
import { useProvider } from "./useProvider";

export type OtterscanRuntime = {
  config?: OtterscanConfig;
  provider?: ethers.providers.JsonRpcProvider;
};

export const useRuntime = (): OtterscanRuntime => {
  const [configOK, config] = useConfig();
  const provider = useProvider(configOK ? config?.erigonURL : undefined);

  const runtime = useMemo(
    (): OtterscanRuntime => ({ config, provider }),
    [config, provider]
  );

  if (!configOK) {
    return {};
  }
  return runtime;
};

export const RuntimeContext = React.createContext<OtterscanRuntime>(null!);
