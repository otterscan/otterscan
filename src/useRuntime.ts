import { JsonRpcApiProvider, JsonRpcProvider, Network } from "ethers";
import { createContext } from "react";
import { OtterscanConfig } from "./useConfig";
import { createAndProbeProvider } from "./useProvider";

/**
 * A runtime comprises a OtterscanConfig read from somewhere, +
 * ETH provider + status object built from the config.
 */
export type OtterscanRuntime = {
  /**
   * Config object; may be null if it is still fetching.
   */
  config?: OtterscanConfig;

  /**
   * ETH provider; may be undefined if not ready because of config fetching,
   * probing occurring, etc.
   */
  provider?: JsonRpcApiProvider;
};

/**
 * Create an OtterscanRuntime based on a previously loaded configuration.
 *
 * If the config specifies a hardcoded chain ID, just create the runtime
 * object and corresponding ethers provider.
 *
 * Otherwise, does the probing process in order to validate the connection
 * is correctly configured and reads the chain ID from the node.
 */
export const createRuntime = async (
  config: Promise<OtterscanConfig>,
): Promise<OtterscanRuntime> => {
  const effectiveConfig = await config;

  // Hardcoded config
  if (effectiveConfig.experimentalFixedChainId !== undefined) {
    const network = Network.from(effectiveConfig.experimentalFixedChainId);
    return {
      config: effectiveConfig,
      provider: new JsonRpcProvider(effectiveConfig.erigonURL, network, {
        staticNetwork: network,
      }),
    };
  }

  const provider = await createAndProbeProvider(
    effectiveConfig?.erigonURL,
    effectiveConfig?.experimentalFixedChainId,
  );
  return {
    config: effectiveConfig,
    provider,
  };
};

/**
 * App-level context holding the runtime data. Use it only once.
 */
export const RuntimeContext = createContext<OtterscanRuntime>(null!);
