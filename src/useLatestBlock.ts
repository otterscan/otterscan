import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { provider } from "./ethersconfig";

export const useLatestBlock = () => {
  const [latestBlock, setLatestBlock] = useState<ethers.providers.Block>();

  useEffect(() => {
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
  }, []);

  return latestBlock;
};

export const useLatestBlockNumber = () => {
  const [latestBlock, setLatestBlock] = useState<number>();

  useEffect(() => {
    const readLatestBlock = async () => {
      const blockNum = await provider.getBlockNumber();
      setLatestBlock(blockNum);
    };
    readLatestBlock();

    const listener = async (blockNumber: number) => {
      setLatestBlock(blockNumber);
    };

    provider.on("block", listener);
    return () => {
      provider.removeListener("block", listener);
    };
  }, []);

  return latestBlock;
};
