import { useState, useEffect } from "react";
import { Block } from "@ethersproject/abstract-provider";
import { JsonRpcProvider } from "@ethersproject/providers";

export const useLatestBlock = (provider?: JsonRpcProvider) => {
  const [latestBlock, setLatestBlock] = useState<Block>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    // TODO: remove duplicated code
    const readLatestBlock = async () => {
      const blockNum = await provider.getBlockNumber();
      const _raw = await provider.send("erigon_getHeaderByNumber", [blockNum]);
      const _block = provider.formatter.block(_raw);
      setLatestBlock(_block);
    };
    readLatestBlock();

    const listener = async (blockNumber: number) => {
      const _raw = await provider.send("erigon_getHeaderByNumber", [
        blockNumber,
      ]);
      const _block = provider.formatter.block(_raw);
      setLatestBlock(_block);
    };

    provider.on("block", listener);
    return () => {
      provider.removeListener("block", listener);
    };
  }, [provider]);

  return latestBlock;
};

/**
 * Returns the latest block number AND hook an internal listener
 * that'll update and trigger a component render as a side effect
 * every time it is notified of a new block by the web3 provider.
 */
export const useLatestBlockNumber = (provider?: JsonRpcProvider) => {
  const [latestBlock, setLatestBlock] = useState<number>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    // Immediately read and set the latest block number
    const readLatestBlock = async () => {
      const blockNum = await provider.getBlockNumber();
      setLatestBlock(blockNum);
    };
    readLatestBlock();

    // Hook a listener that'll update the latest block number
    // every time it is notified of a new block
    const listener = async (blockNumber: number) => {
      setLatestBlock(blockNumber);
    };

    provider.on("block", listener);
    return () => {
      provider.removeListener("block", listener);
    };
  }, [provider]);

  return latestBlock;
};
