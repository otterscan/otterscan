import { useState, useEffect } from "react";
import { Block, BlockWithTransactions } from "@ethersproject/abstract-provider";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { arrayify, hexDataSlice, isHexString } from "@ethersproject/bytes";
import useSWR, { useSWRConfig } from "swr";
import { getInternalOperations } from "./nodeFunctions";
import {
  TokenMetas,
  TokenTransfer,
  TransactionData,
  InternalOperation,
  ProcessedTransaction,
  OperationType,
  ChecksummedAddress,
} from "./types";
import erc20 from "./erc20.json";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export interface ExtendedBlock extends Block {
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
  provider: JsonRpcProvider,
  blockNumberOrHash: string
): Promise<ExtendedBlock | null> => {
  let blockPromise: Promise<any>;
  if (isHexString(blockNumberOrHash, 32)) {
    blockPromise = provider.send("ots_getBlockDetailsByHash", [
      blockNumberOrHash,
    ]);
  } else {
    const blockNumber = parseInt(blockNumberOrHash);
    if (isNaN(blockNumber) || blockNumber < 0) {
      return null;
    }
    blockPromise = provider.send("ots_getBlockDetails", [blockNumber]);
  }

  const _rawBlock = await blockPromise;
  if (_rawBlock === null) {
    return null;
  }
  const _block = provider.formatter.block(_rawBlock.block);
  const _rawIssuance = _rawBlock.issuance;

  const extBlock: ExtendedBlock = {
    blockReward: provider.formatter.bigNumber(_rawIssuance.blockReward ?? 0),
    unclesReward: provider.formatter.bigNumber(_rawIssuance.uncleReward ?? 0),
    feeReward: provider.formatter.bigNumber(_rawBlock.totalFees),
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
  provider: JsonRpcProvider | undefined,
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
        .map((t, i): ProcessedTransaction => {
          const _rawReceipt = _receipts[i];
          // Empty logs on purpose because of ethers formatter requires it
          _rawReceipt.logs = [];
          const _receipt = provider.formatter.receipt(_rawReceipt);

          return {
            blockNumber: blockNumber,
            timestamp: _block.timestamp,
            miner: _block.miner,
            idx: i,
            hash: t.hash,
            from: t.from,
            to: t.to ?? null,
            createdContractAddress: _receipt.contractAddress,
            value: t.value,
            fee:
              t.type !== 2
                ? provider.formatter
                    .bigNumber(_receipt.gasUsed)
                    .mul(t.gasPrice!)
                : provider.formatter
                    .bigNumber(_receipt.gasUsed)
                    .mul(t.maxPriorityFeePerGas!.add(_block.baseFeePerGas!)),
            gasPrice:
              t.type !== 2
                ? t.gasPrice!
                : t.maxPriorityFeePerGas!.add(_block.baseFeePerGas!),
            data: t.data,
            status: provider.formatter.number(_receipt.status),
          };
        })
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
                res.miner === getAddress(op.to)
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
  provider: JsonRpcProvider | undefined,
  blockNumberOrHash: string
): ExtendedBlock | null | undefined => {
  const [block, setBlock] = useState<ExtendedBlock | null | undefined>();
  useEffect(() => {
    if (!provider) {
      return undefined;
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
  provider: JsonRpcProvider | undefined,
  txhash: string
): TransactionData | undefined | null => {
  const [txData, setTxData] = useState<TransactionData | undefined | null>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    const readTxData = async () => {
      try {
        const [_response, _receipt] = await Promise.all([
          provider.getTransaction(txhash),
          provider.getTransactionReceipt(txhash),
        ]);
        if (_response === null) {
          setTxData(null);
          return;
        }

        let _block: ExtendedBlock | null | undefined;
        if (_response.blockNumber) {
          _block = await readBlock(provider, _response.blockNumber.toString());
        }

        document.title = `Transaction ${_response.hash} | Otterscan`;

        // Extract token transfers
        const tokenTransfers: TokenTransfer[] = [];
        if (_receipt) {
          for (const l of _receipt.logs) {
            if (l.topics.length !== 3) {
              continue;
            }
            if (l.topics[0] !== TRANSFER_TOPIC) {
              continue;
            }
            tokenTransfers.push({
              token: l.address,
              from: getAddress(hexDataSlice(arrayify(l.topics[1]), 12)),
              to: getAddress(hexDataSlice(arrayify(l.topics[2]), 12)),
              value: BigNumber.from(l.data),
            });
          }
        }

        // Extract token meta
        const tokenMetas: TokenMetas = {};
        for (const t of tokenTransfers) {
          if (tokenMetas[t.token] !== undefined) {
            continue;
          }
          const erc20Contract = new Contract(t.token, erc20, provider);
          try {
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
          } catch (err) {
            tokenMetas[t.token] = null;
            console.warn(
              `Couldn't get token ${t.token} metadata; ignoring`,
              err
            );
          }
        }

        setTxData({
          transactionHash: _response.hash,
          from: _response.from,
          to: _response.to,
          value: _response.value,
          tokenTransfers,
          tokenMetas,
          type: _response.type ?? 0,
          maxFeePerGas: _response.maxFeePerGas,
          maxPriorityFeePerGas: _response.maxPriorityFeePerGas,
          gasPrice: _response.gasPrice!,
          gasLimit: _response.gasLimit,
          nonce: _response.nonce,
          data: _response.data,
          confirmedData:
            _receipt === null
              ? undefined
              : {
                  status: _receipt.status === 1,
                  blockNumber: _receipt.blockNumber,
                  transactionIndex: _receipt.transactionIndex,
                  blockBaseFeePerGas: _block!.baseFeePerGas,
                  blockTransactionCount: _block!.transactionCount,
                  confirmations: _receipt.confirmations,
                  timestamp: _block!.timestamp,
                  miner: _block!.miner,
                  createdContractAddress: _receipt.contractAddress,
                  fee: _response.gasPrice!.mul(_receipt.gasUsed),
                  gasUsed: _receipt.gasUsed,
                  logs: _receipt.logs,
                },
        });
      } catch (err) {
        console.error(err);
        setTxData(null);
      }
    };

    readTxData();
  }, [provider, txhash]);

  return txData;
};

export const useInternalOperations = (
  provider: JsonRpcProvider | undefined,
  txData: TransactionData | undefined | null
): InternalOperation[] | undefined => {
  const [intTransfers, setIntTransfers] = useState<InternalOperation[]>();

  useEffect(() => {
    const traceTransfers = async () => {
      if (!provider || !txData || !txData.confirmedData) {
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

export type TraceEntry = {
  type: string;
  depth: number;
  from: string;
  to: string;
  value: BigNumber;
  input: string;
};

export type TraceGroup = TraceEntry & {
  children: TraceGroup[] | null;
};

export const useTraceTransaction = (
  provider: JsonRpcProvider | undefined,
  txHash: string
): TraceGroup[] | undefined => {
  const [traceGroups, setTraceGroups] = useState<TraceGroup[] | undefined>();

  useEffect(() => {
    if (!provider) {
      setTraceGroups(undefined);
      return;
    }

    const traceTx = async () => {
      const results = await provider.send("ots_traceTransaction", [txHash]);

      // Implement better formatter
      for (let i = 0; i < results.length; i++) {
        results[i].from = provider.formatter.address(results[i].from);
        results[i].to = provider.formatter.address(results[i].to);
        results[i].value =
          results[i].value === null
            ? null
            : provider.formatter.bigNumber(results[i].value);
      }

      // Build trace tree
      const buildTraceTree = (
        flatList: TraceEntry[],
        depth: number = 0
      ): TraceGroup[] => {
        const entries: TraceGroup[] = [];

        let children: TraceEntry[] | null = null;
        for (let i = 0; i < flatList.length; i++) {
          if (flatList[i].depth === depth) {
            if (children !== null) {
              const childrenTree = buildTraceTree(children, depth + 1);
              const prev = entries.pop();
              if (prev) {
                prev.children = childrenTree;
                entries.push(prev);
              }
            }

            entries.push({
              ...flatList[i],
              children: null,
            });
            children = null;
          } else {
            if (children === null) {
              children = [];
            }
            children.push(flatList[i]);
          }
        }
        if (children !== null) {
          const childrenTree = buildTraceTree(children, depth + 1);
          const prev = entries.pop();
          if (prev) {
            prev.children = childrenTree;
            entries.push(prev);
          }
        }

        return entries;
      };

      const traceTree = buildTraceTree(results);
      setTraceGroups(traceTree);
    };
    traceTx();
  }, [provider, txHash]);

  return traceGroups;
};

const hasCode = async (
  provider: JsonRpcProvider,
  address: ChecksummedAddress
): Promise<boolean> => {
  const result = await provider.send("ots_hasCode", [address, "latest"]);
  return result as boolean;
};

export const useAddressesWithCode = (
  provider: JsonRpcProvider | undefined,
  addresses: ChecksummedAddress[]
): ChecksummedAddress[] | undefined => {
  const [results, setResults] = useState<ChecksummedAddress[] | undefined>();

  useEffect(() => {
    // Reset
    setResults(undefined);

    if (provider === undefined) {
      return;
    }

    const readCodes = async () => {
      const checkers: Promise<boolean>[] = [];
      for (const a of addresses) {
        checkers.push(hasCode(provider, a));
      }

      const result = await Promise.all(checkers);
      const filtered = addresses.filter((_, i) => result[i]);
      setResults(filtered);
    };
    readCodes();
  }, [provider, addresses]);

  return results;
};

// Error(string)
const ERROR_MESSAGE_SELECTOR = "0x08c379a0";

export const useTransactionError = (
  provider: JsonRpcProvider | undefined,
  txHash: string
): [string | undefined, string | undefined, boolean | undefined] => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [data, setData] = useState<string | undefined>();
  const [isCustomError, setCustomError] = useState<boolean | undefined>();

  useEffect(() => {
    // Reset
    setErrorMsg(undefined);
    setData(undefined);
    setCustomError(undefined);

    if (provider === undefined) {
      return;
    }

    const readCodes = async () => {
      const result = (await provider.send("ots_getTransactionError", [
        txHash,
      ])) as string;

      // Empty or success
      if (result === "0x") {
        setErrorMsg(undefined);
        setData(result);
        setCustomError(false);
        return;
      }

      // Filter hardcoded Error(string) selector because ethers don't let us
      // construct it
      const selector = result.substr(0, 10);
      if (selector === ERROR_MESSAGE_SELECTOR) {
        const msg = defaultAbiCoder.decode(
          ["string"],
          "0x" + result.substr(10)
        );
        setErrorMsg(msg[0]);
        setData(result);
        setCustomError(false);
        return;
      }

      setErrorMsg(undefined);
      setData(result);
      setCustomError(true);
    };
    readCodes();
  }, [provider, txHash]);

  return [errorMsg, data, isCustomError];
};

export const useTransactionCount = (
  provider: JsonRpcProvider | undefined,
  sender: ChecksummedAddress | undefined
): number | undefined => {
  const { data, error } = useSWR(
    provider && sender ? { provider, sender } : null,
    async ({ provider, sender }): Promise<number | undefined> =>
      provider.getTransactionCount(sender)
  );

  if (error) {
    return undefined;
  }
  return data;
};

type TransactionBySenderAndNonceKey = {
  network: number;
  sender: ChecksummedAddress;
  nonce: number;
};

const getTransactionBySenderAndNonceFetcher =
  (provider: JsonRpcProvider) =>
  async ({
    network,
    sender,
    nonce,
  }: TransactionBySenderAndNonceKey): Promise<string | null | undefined> => {
    if (nonce < 0) {
      return undefined;
    }

    const result = (await provider.send("ots_getTransactionBySenderAndNonce", [
      sender,
      nonce,
    ])) as string;

    // Empty or success
    return result;
  };

export const prefetchTransactionBySenderAndNonce = (
  { mutate }: ReturnType<typeof useSWRConfig>,
  provider: JsonRpcProvider,
  sender: ChecksummedAddress,
  nonce: number
) => {
  const key: TransactionBySenderAndNonceKey = {
    network: provider.network.chainId,
    sender,
    nonce,
  };
  mutate(key, (curr: any) => {
    if (curr) {
      return curr;
    }
    return getTransactionBySenderAndNonceFetcher(provider)(key);
  });
  // }
};

export const useTransactionBySenderAndNonce = (
  provider: JsonRpcProvider | undefined,
  sender: ChecksummedAddress | undefined,
  nonce: number | undefined
): string | null | undefined => {
  const { data, error } = useSWR<
    string | null | undefined,
    any,
    TransactionBySenderAndNonceKey | null
  >(
    provider && sender && nonce !== undefined
      ? {
          network: provider.network.chainId,
          sender,
          nonce,
        }
      : null,
    getTransactionBySenderAndNonceFetcher(provider!)
  );

  if (error) {
    return undefined;
  }
  return data;
};
