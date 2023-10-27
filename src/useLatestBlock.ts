import { Block, JsonRpcApiProvider } from "ethers";
import { useEffect, useState } from "react";
import { formatter } from "./utils/formatter";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { BlockchainInfo } from '@zilliqa-js/core/dist/types/src/types'

const refreshRate = 30000 // In milliseconds

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

/**
 * Returns the latest chain information AND hoook an internal listener
 * that'll update and trigger a component reder as a side effect every
 * the poll returns a different value
 */

export const useLatestBlockChainInfo = (zilliqa?: Zilliqa) 
: BlockchainInfo | undefined => {
  const [latestBlockChainInfo, setLatestBlockChainInfo] = useState<BlockchainInfo>();

  useEffect(() => {
    // TODO: Is this necessary to check whether the hook has been removed
    let isCancelled = false
    if (!zilliqa) {
      return;
    }

    const getData = async () => {
      const blockChainInfo = await zilliqa.blockchain.getBlockChainInfo();
      if (!isCancelled && blockChainInfo) {
        setLatestBlockChainInfo(blockChainInfo.result);
      }
    }
    getData()
    const getDataTimer = setInterval(async () => {
      await getData()
    }, refreshRate)
    return () => {
      isCancelled = true
      clearInterval(getDataTimer)
    }
  }, [zilliqa]);

  return latestBlockChainInfo;
};

interface BCInfoState {
  startTxBlock: number,
  maxTPS: number,
  maxTPSTxBlockNum: number,
  maxTxnCount: number,
  maxTxnCountTxBlockNum: number
}

export const useBCInfoStateInfo = (latestBlockChainInfo?: BlockchainInfo)  
: BCInfoState | undefined => {

  const [state, setState] = useState<BCInfoState>();

  useEffect(() => {
    setState((prevState: BCInfoState | undefined) => {
      if(latestBlockChainInfo === undefined) return prevState;

      if(prevState === undefined){
        return {
          startTxBlock: parseInt(latestBlockChainInfo.NumTxBlocks, 10) - 1,
          maxTPS: latestBlockChainInfo.TransactionRate,
          maxTPSTxBlockNum: parseInt(latestBlockChainInfo.NumTxBlocks, 10) - 1, 
          maxTxnCount: parseInt(latestBlockChainInfo.NumTxnsTxEpoch, 10),
          maxTxnCountTxBlockNum: parseInt(latestBlockChainInfo.NumTxBlocks, 10) - 1,
        };
      };
        
      const newState : BCInfoState = { ...prevState};
      if (prevState.maxTPS <= latestBlockChainInfo.TransactionRate) {
        newState.maxTPS = latestBlockChainInfo.TransactionRate
        newState.maxTPSTxBlockNum = parseInt(latestBlockChainInfo.NumTxBlocks, 10) - 1
      }
      if (prevState.maxTxnCount <= parseInt(latestBlockChainInfo.NumTxnsTxEpoch, 10)) {
        newState.maxTxnCount = parseInt(latestBlockChainInfo.NumTxnsTxEpoch, 10)
        newState.maxTxnCountTxBlockNum = parseInt(latestBlockChainInfo.NumTxBlocks, 10) - 1
      }
      return newState
    });
  }, [latestBlockChainInfo]);

  return state;
}
