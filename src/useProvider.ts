import {
  JsonRpcApiProvider,
  JsonRpcProvider,
  Network,
  WebSocketProvider,
} from "ethers";
import { useEffect, useState } from "react";
import { MIN_API_LEVEL } from "./params";
import { ConnectionStatus } from "./types";

export const DEFAULT_ERIGON_URL = "http://127.0.0.1:8545";

export const useProvider = (
  erigonURL?: string,
  experimentalFixedChainId?: number,
): [ConnectionStatus, JsonRpcApiProvider | undefined] => {
  const [connStatus, setConnStatus] = useState<ConnectionStatus>(
    ConnectionStatus.CONNECTING,
  );

  if (erigonURL !== undefined) {
    if (erigonURL === "") {
      console.info(`Using default erigon URL: ${DEFAULT_ERIGON_URL}`);
      erigonURL = DEFAULT_ERIGON_URL;
    } else {
      console.log(`Using configured erigon URL: ${erigonURL}`);
    }
  }

  const [provider, setProvider] = useState<JsonRpcApiProvider | undefined>();
  useEffect(() => {
    // Skip probing?
    if (experimentalFixedChainId !== undefined) {
      console.log("Skipping node probe");
      setConnStatus(ConnectionStatus.CONNECTED);
      const network = Network.from(experimentalFixedChainId);
      setProvider(
        new JsonRpcProvider(erigonURL, network, { staticNetwork: network }),
      );
      return;
    }

    if (erigonURL === undefined) {
      setConnStatus(ConnectionStatus.NOT_ETH_NODE);
      setProvider(undefined);
      return;
    }

    setConnStatus(ConnectionStatus.CONNECTING);

    const tryToConnect = async () => {
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
        setConnStatus(ConnectionStatus.NOT_ETH_NODE);
        setProvider(undefined);
        return;
      }

      // Check if it is an Erigon node by probing a lightweight method
      try {
        await provider.send("erigon_getHeaderByNumber", [blockNumber]);
      } catch (err) {
        console.log(err);
        setConnStatus(ConnectionStatus.NOT_ERIGON);
        setProvider(undefined);
        return;
      }

      // Check if it has Otterscan patches by probing a lightweight method
      try {
        const level = await provider.send("ots_getApiLevel", []);
        if (level < MIN_API_LEVEL) {
          setConnStatus(ConnectionStatus.NOT_OTTERSCAN_PATCHED);
          setProvider(undefined);
        } else {
          setConnStatus(ConnectionStatus.CONNECTED);
          setProvider(provider);
        }
      } catch (err) {
        console.log(err);
        setConnStatus(ConnectionStatus.NOT_OTTERSCAN_PATCHED);
        setProvider(undefined);
      }
    };
    tryToConnect();
  }, [erigonURL, experimentalFixedChainId]);

  return [connStatus, provider];
};
