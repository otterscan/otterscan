import { useState, useEffect } from "react";
import { Block, JsonRpcApiProvider } from "ethers";
import { formatter } from "./utils/formatter";

/**
 * Returns the latest block header AND hook an internal listener
 * that'll update and trigger a component render as a side effect
 * every time it is notified of a new block by the web3 provider.
 */
export const useLatestBlockHeader = (provider?: JsonRpcApiProvider) => {
  const [latestBlock, setLatestBlock] = useState<Block>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    const getAndSetBlockHeader = async (blockNumber: number) => {
      const _raw = await provider.send("erigon_getHeaderByNumber", [
        blockNumber,
      ]);
      const _block = new Block(formatter.blockParams(_raw), provider);
      setLatestBlock(_block);
    };

    // Immediately read and set the latest block header
    const readLatestBlock = async () => {
      const blockNum = await provider.getBlockNumber();
      await getAndSetBlockHeader(blockNum);
    };
    readLatestBlock();

    // Hook a listener that'll update the latest block header
    // every time it is notified of a new block
    provider.on("block", getAndSetBlockHeader);
    return () => {
      provider.removeListener("block", getAndSetBlockHeader);
    };
  }, [provider]);

  return latestBlock;
};

/**
 * Returns the latest block number AND hook an internal listener
 * that'll update and trigger a component render as a side effect
 * every time it is notified of a new block by the web3 provider.
 *
 * This hook is cheaper than useLatestBlockHeader.
 */
export const useLatestBlockNumber = (provider?: JsonRpcApiProvider) => {
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
