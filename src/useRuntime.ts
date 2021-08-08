import React, { useMemo } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { OtterscanConfig, useConfig } from "./useConfig";
import { useProvider } from "./useProvider";
import { ConnectionStatus } from "./types";

export type OtterscanRuntime = {
  config?: OtterscanConfig;
  connStatus: ConnectionStatus;
  provider?: JsonRpcProvider;
};

export const useRuntime = (): OtterscanRuntime => {
  const [configOK, config] = useConfig();
  const [connStatus, provider] = useProvider(
    configOK ? config?.erigonURL : undefined
  );

  const runtime = useMemo(
    (): OtterscanRuntime => ({ config, connStatus, provider }),
    [config, connStatus, provider]
  );

  if (!configOK) {
    return { connStatus: ConnectionStatus.CONNECTING };
  }
  return runtime;
};

export const RuntimeContext = React.createContext<OtterscanRuntime>(null!);
