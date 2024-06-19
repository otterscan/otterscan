import {
  JsonRpcApiProvider,
  JsonRpcProvider,
  Network,
  WebSocketProvider,
} from "ethers";
import { ProbeError } from "./ProbeError";
import { MIN_API_LEVEL } from "./params";
import { ConnectionStatus } from "./types";

export const DEFAULT_ERIGON_URL = "http://127.0.0.1:8545";

export const createAndProbeProvider = async (
  erigonURL?: string,
  experimentalFixedChainId?: number,
): Promise<JsonRpcApiProvider | undefined> => {
  if (erigonURL !== undefined) {
    if (erigonURL === "") {
      console.info(`Using default erigon URL: ${DEFAULT_ERIGON_URL}`);
      erigonURL = DEFAULT_ERIGON_URL;
    } else {
      console.log(`Using configured erigon URL: ${erigonURL}`);
    }
  }

  // Skip probing?
  if (experimentalFixedChainId !== undefined) {
    console.log("Skipping node probe");
    const network = Network.from(experimentalFixedChainId);
    return new JsonRpcProvider(erigonURL, network, { staticNetwork: network });
  }

  if (erigonURL === undefined) {
    throw new ProbeError(ConnectionStatus.NOT_ETH_NODE, "");
  }

  let provider: JsonRpcApiProvider;
  if (erigonURL?.startsWith("ws://") || erigonURL?.startsWith("wss://")) {
    provider = new WebSocketProvider(erigonURL, undefined, {
      staticNetwork: true,
    });
  } else {
    // Batching takes place by default
    provider = new JsonRpcProvider(erigonURL, undefined, {
      staticNetwork: true,
    });
  }

  // Check if it is at least a regular ETH node
  let blockNumber: number = 0;
  try {
    blockNumber = await provider.getBlockNumber();
  } catch (err) {
    console.log(err);
    throw new ProbeError(ConnectionStatus.NOT_ETH_NODE, erigonURL);
  }

  // Check if it is an Erigon node by probing a lightweight method
  try {
    await provider.send("erigon_getHeaderByNumber", [blockNumber]);
  } catch (err) {
    console.log(err);
    throw new ProbeError(ConnectionStatus.NOT_ERIGON, erigonURL);
  }

  // Check if it has Otterscan patches by probing a lightweight method
  try {
    const level = await provider.send("ots_getApiLevel", []);
    if (level < MIN_API_LEVEL) {
      throw new ProbeError(ConnectionStatus.NOT_OTTERSCAN_PATCHED, erigonURL);
    }
    return provider;
  } catch (err) {
    console.log(err);
    throw new ProbeError(ConnectionStatus.NOT_OTTERSCAN_PATCHED, erigonURL);
  }
};
