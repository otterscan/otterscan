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
  const config = useConfig();
  const [connStatus, provider] = useProvider(config?.erigonURL);

  const runtime = useMemo((): OtterscanRuntime => {
    if (config === undefined) {
      return { connStatus: ConnectionStatus.CONNECTING };
    }
    return { config, connStatus, provider };
  }, [config, connStatus, provider]);

  return runtime;
};

export const RuntimeContext = React.createContext<OtterscanRuntime>(null!);
