import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { getInternalOperations } from "./nodeFunctions";
import {
  TokenMetas,
  TokenTransfer,
  TransactionData,
  InternalOperation,
  ProcessedTransaction,
  OperationType,
} from "./types";
import erc20 from "./erc20.json";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export interface ExtendedBlock extends ethers.providers.Block {
  blockReward: BigNumber;
  unclesReward: BigNumber;
  feeReward: BigNumber;
  size: number;
  sha3Uncles: string;
  stateRoot: string;
  totalDifficulty: BigNumber;
  transactionCount: number;
}

export const readBlock = async (
  provider: ethers.providers.JsonRpcProvider,
  blockNumberOrHash: string
) => {
  let blockPromise: Promise<any>;
  if (ethers.utils.isHexString(blockNumberOrHash, 32)) {
    // TODO: fix
    blockPromise = provider.send("eth_getBlockByHash", [
      blockNumberOrHash,
      false,
    ]);
  } else {
    blockPromise = provider.send("ots_getBlockDetails", [blockNumberOrHash]);
  }

  const _rawBlock = await blockPromise;
  const _block = provider.formatter.block(_rawBlock.block);
  const _rawIssuance = _rawBlock.issuance;
  const fees = provider.formatter.bigNumber(_rawBlock.totalFees);

  const extBlock: ExtendedBlock = {
    blockReward: provider.formatter.bigNumber(_rawIssuance.blockReward ?? 0),
    unclesReward: provider.formatter.bigNumber(_rawIssuance.uncleReward ?? 0),
    feeReward: fees,
    size: provider.formatter.number(_rawBlock.block.size),
    sha3Uncles: _rawBlock.block.sha3Uncles,
    stateRoot: _rawBlock.block.stateRoot,
    totalDifficulty: provider.formatter.bigNumber(
      _rawBlock.block.totalDifficulty
    ),
    transactionCount: provider.formatter.number(
      _rawBlock.block.transactionCount
    ),
    ..._block,
  };
  return extBlock;
};

export const useBlockTransactions = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  blockNumber: number,
  pageNumber: number,
  pageSize: number
): [number | undefined, ProcessedTransaction[] | undefined] => {
  const [totalTxs, setTotalTxs] = useState<number>();
  const [txs, setTxs] = useState<ProcessedTransaction[]>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    const readBlock = async () => {
      const result = await provider.send("ots_getBlockTransactions", [
        blockNumber,
        pageNumber,
        pageSize,
      ]);
      const _block = provider.formatter.blockWithTransactions(
        result.fullblock
      ) as unknown as BlockWithTransactions;
      const _receipts = result.receipts;

      const rawTxs = _block.transactions
        .map(
          (t, i): ProcessedTransaction => ({
            blockNumber: blockNumber,
            timestamp: _block.timestamp,
            miner: _block.miner,
            idx: i,
            hash: t.hash,
            from: t.from,
            to: t.to,
            createdContractAddress: _receipts[i].contractAddress,
            value: t.value,
            fee:
              t.type !== 2
                ? provider.formatter
                    .bigNumber(_receipts[i].gasUsed)
                    .mul(t.gasPrice!)
                : provider.formatter
                    .bigNumber(_receipts[i].gasUsed)
                    .mul(t.maxPriorityFeePerGas!.add(_block.baseFeePerGas!)),
            gasPrice:
              t.type !== 2
                ? t.gasPrice!
                : t.maxPriorityFeePerGas!.add(_block.baseFeePerGas!),
            data: t.data,
            status: provider.formatter.number(_receipts[i].status),
          })
        )
        .reverse();
      setTxs(rawTxs);
      setTotalTxs(result.fullblock.transactionCount);

      const checkTouchMinerAddr = await Promise.all(
        rawTxs.map(async (res) => {
          const ops = await getInternalOperations(provider, res.hash);
          return (
            ops.findIndex(
              (op) =>
                op.type === OperationType.TRANSFER &&
                res.miner !== undefined &&
                res.miner === ethers.utils.getAddress(op.to)
            ) !== -1
          );
        })
      );
      const processedTxs = rawTxs.map(
        (r, i): ProcessedTransaction => ({
          ...r,
          internalMinerInteraction: checkTouchMinerAddr[i],
        })
      );
      setTxs(processedTxs);
    };
    readBlock();
  }, [provider, blockNumber, pageNumber, pageSize]);

  return [totalTxs, txs];
};

export const useBlockData = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  blockNumberOrHash: string
) => {
  const [block, setBlock] = useState<ExtendedBlock>();
  useEffect(() => {
    if (!provider) {
      return;
    }

    const _readBlock = async () => {
      const extBlock = await readBlock(provider, blockNumberOrHash);
      setBlock(extBlock);
    };
    _readBlock();
  }, [provider, blockNumberOrHash]);

  return block;
};

export const useTxData = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  txhash: string
): TransactionData | undefined => {
  const [txData, setTxData] = useState<TransactionData>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    const readTxData = async () => {
      const [_response, _receipt] = await Promise.all([
        provider.getTransaction(txhash),
        provider.getTransactionReceipt(txhash),
      ]);
      const _block = await readBlock(provider, _receipt.blockNumber.toString());
      document.title = `Transaction ${_response.hash} | Otterscan`;

      // Extract token transfers
      const tokenTransfers: TokenTransfer[] = [];
      for (const l of _receipt.logs) {
        if (l.topics.length !== 3) {
          continue;
        }
        if (l.topics[0] !== TRANSFER_TOPIC) {
          continue;
        }
        tokenTransfers.push({
          token: l.address,
          from: ethers.utils.getAddress(
            ethers.utils.hexDataSlice(ethers.utils.arrayify(l.topics[1]), 12)
          ),
          to: ethers.utils.getAddress(
            ethers.utils.hexDataSlice(ethers.utils.arrayify(l.topics[2]), 12)
          ),
          value: BigNumber.from(l.data),
        });
      }

      // Extract token meta
      const tokenMetas: TokenMetas = {};
      for (const t of tokenTransfers) {
        if (tokenMetas[t.token]) {
          continue;
        }
        const erc20Contract = new ethers.Contract(t.token, erc20, provider);
        const [name, symbol, decimals] = await Promise.all([
          erc20Contract.name(),
          erc20Contract.symbol(),
          erc20Contract.decimals(),
        ]);
        tokenMetas[t.token] = {
          name,
          symbol,
          decimals,
        };
      }

      setTxData({
        transactionHash: _receipt.transactionHash,
        status: _receipt.status === 1,
        blockNumber: _receipt.blockNumber,
        transactionIndex: _receipt.transactionIndex,
        blockTransactionCount: _block.transactionCount,
        confirmations: _receipt.confirmations,
        timestamp: _block.timestamp,
        miner: _block.miner,
        from: _receipt.from,
        to: _receipt.to,
        createdContractAddress: _receipt.contractAddress,
        value: _response.value,
        tokenTransfers,
        tokenMetas,
        type: _response.type ?? 0,
        fee: _response.gasPrice!.mul(_receipt.gasUsed),
        blockBaseFeePerGas: _block.baseFeePerGas,
        maxFeePerGas: _response.maxFeePerGas,
        maxPriorityFeePerGas: _response.maxPriorityFeePerGas,
        gasPrice: _response.gasPrice!,
        gasUsed: _receipt.gasUsed,
        gasLimit: _response.gasLimit,
        nonce: _response.nonce,
        data: _response.data,
        logs: _receipt.logs,
      });
    };
    readTxData();
  }, [provider, txhash]);

  return txData;
};

export const useInternalOperations = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  txData: TransactionData | undefined
): InternalOperation[] | undefined => {
  const [intTransfers, setIntTransfers] = useState<InternalOperation[]>();

  useEffect(() => {
    const traceTransfers = async () => {
      if (!provider || !txData) {
        return;
      }

      const _transfers = await getInternalOperations(
        provider,
        txData.transactionHash
      );
      for (const t of _transfers) {
        t.from = provider.formatter.address(t.from);
        t.to = provider.formatter.address(t.to);
        t.value = provider.formatter.bigNumber(t.value);
      }
      setIntTransfers(_transfers);
    };
    traceTransfers();
  }, [provider, txData]);

  return intTransfers;
};
