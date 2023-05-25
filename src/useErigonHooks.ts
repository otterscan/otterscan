import { useState, useEffect, useMemo } from "react";
import {
  Block,
  BlockWithTransactions,
  BlockTag,
} from "@ethersproject/abstract-provider";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { arrayify, hexDataSlice, isHexString } from "@ethersproject/bytes";
import { AddressZero } from "@ethersproject/constants";
import useSWR, { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import {
  TokenTransfer,
  TransactionData,
  InternalOperation,
  ProcessedTransaction,
  OperationType,
  ChecksummedAddress,
  TokenMeta,
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
    };
    readBlock();
  }, [provider, blockNumber, pageNumber, pageSize]);

  return [totalTxs, txs];
};

const blockDataFetcher: Fetcher<
  ExtendedBlock | null,
  [JsonRpcProvider, string]
> = async ([provider, blockNumberOrHash]) => {
  return readBlock(provider, blockNumberOrHash);
};

// TODO: some callers may use only block headers?
export const useBlockData = (
  provider: JsonRpcProvider | undefined,
  blockNumberOrHash: string | undefined
): ExtendedBlock | null | undefined => {
  const { data, error } = useSWRImmutable(
    provider !== undefined && blockNumberOrHash !== undefined
      ? [provider, blockNumberOrHash]
      : null,
    blockDataFetcher
  );
  if (error) {
    return undefined;
  }
  return data;
};

export const useBlockDataFromTransaction = (
  provider: JsonRpcProvider | undefined,
  txData: TransactionData | null | undefined
): ExtendedBlock | null | undefined => {
  const block = useBlockData(
    provider,
    txData?.confirmedData
      ? txData.confirmedData.blockNumber.toString()
      : undefined
  );
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

        setTxData({
          transactionHash: _response.hash,
          from: _response.from,
          to: _response.to,
          value: _response.value,
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
                  confirmations: _receipt.confirmations,
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

export const useTokenTransfers = (
  txData: TransactionData
): TokenTransfer[] | undefined => {
  const transfers = useMemo(() => {
    if (!txData.confirmedData) {
      return undefined;
    }

    return txData.confirmedData.logs
      .filter((l) => l.topics.length === 3 && l.topics[0] === TRANSFER_TOPIC)
      .map((l) => ({
        token: l.address,
        from: getAddress(hexDataSlice(arrayify(l.topics[1]), 12)),
        to: getAddress(hexDataSlice(arrayify(l.topics[2]), 12)),
        value: BigNumber.from(l.data),
      }));
  }, [txData]);

  return transfers;
};

export const useInternalOperations = (
  provider: JsonRpcProvider | undefined,
  txHash: string | undefined
): InternalOperation[] | undefined => {
  const { data, error } = useSWRImmutable(
    provider !== undefined && txHash !== undefined
      ? ["ots_getInternalOperations", txHash]
      : null,
    providerFetcher(provider)
  );

  const _transfers = useMemo(() => {
    if (provider === undefined || error || data === undefined) {
      return undefined;
    }

    const _t: InternalOperation[] = [];
    for (const t of data) {
      _t.push({
        type: t.type,
        from: provider.formatter.address(getAddress(t.from)),
        to: provider.formatter.address(getAddress(t.to)),
        value: provider.formatter.bigNumber(t.value),
      });
    }
    return _t;
  }, [provider, data]);
  return _transfers;
};

export const useSendsToMiner = (
  provider: JsonRpcProvider | undefined,
  txHash: string | undefined,
  miner: string | undefined
): [boolean, InternalOperation[]] | [undefined, undefined] => {
  const ops = useInternalOperations(provider, txHash);
  if (ops === undefined) {
    return [undefined, undefined];
  }

  const send =
    ops.findIndex(
      (op) =>
        op.type === OperationType.TRANSFER &&
        miner !== undefined &&
        miner === getAddress(op.to)
    ) !== -1;
  return [send, ops];
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

type ContractCreatorKey = {
  type: "cc";
  network: number;
  address: ChecksummedAddress;
};

type ContractCreator = {
  hash: string;
  creator: ChecksummedAddress;
};

export const useContractCreator = (
  provider: JsonRpcProvider | undefined,
  address: ChecksummedAddress | undefined
): ContractCreator | null | undefined => {
  const { data, error } = useSWR<
    ContractCreator | null | undefined,
    any,
    ContractCreatorKey | null
  >(
    provider && address
      ? {
          type: "cc",
          network: provider.network.chainId,
          address,
        }
      : null,
    getContractCreatorFetcher(provider!)
  );

  if (error) {
    return undefined;
  }
  return data as ContractCreator;
};

const getContractCreatorFetcher =
  (provider: JsonRpcProvider) =>
  async ({
    network,
    address,
  }: ContractCreatorKey): Promise<ContractCreator | null | undefined> => {
    const result = (await provider.send("ots_getContractCreator", [
      address,
    ])) as ContractCreator;

    // Empty or success
    if (result) {
      result.creator = provider.formatter.address(result.creator);
    }
    return result;
  };

export const useAddressBalance = (
  provider: JsonRpcProvider | undefined,
  address: ChecksummedAddress | undefined
): BigNumber | null | undefined => {
  const [balance, setBalance] = useState<BigNumber | undefined>();

  useEffect(() => {
    if (!provider || !address) {
      return undefined;
    }

    const readBalance = async () => {
      const _balance = await provider.getBalance(address);
      setBalance(_balance);
    };
    readBalance();
  }, [provider, address]);

  return balance;
};

/**
 * This is a generic fetch for SWR, where the key is an array, whose
 * element 0 is the JSON-RPC method, and the remaining are the method
 * arguments.
 */
export const providerFetcher =
  (
    provider: JsonRpcProvider | undefined
  ): Fetcher<any | undefined, [string, ...any]> =>
  async (key) => {
    if (provider === undefined) {
      return undefined;
    }
    for (const a of key) {
      if (a === undefined) {
        return undefined;
      }
    }

    const method = key[0];
    const args = key.slice(1);
    const result = await provider.send(method, args);
    return result;
  };

export const useHasCode = (
  provider: JsonRpcProvider | undefined,
  address: ChecksummedAddress | undefined,
  blockTag: BlockTag = "latest"
): boolean | undefined => {
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWRImmutable(
    ["ots_hasCode", address, blockTag],
    fetcher
  );
  if (error) {
    return undefined;
  }
  return data as boolean | undefined;
};

const ERC20_PROTOTYPE = new Contract(AddressZero, erc20);

const tokenMetadataFetcher =
  (
    provider: JsonRpcProvider | undefined
  ): Fetcher<TokenMeta | null, ["tokenmeta", ChecksummedAddress]> =>
  async ([_, address]) => {
    if (provider === undefined) {
      return null;
    }

    const erc20Contract = ERC20_PROTOTYPE.connect(provider).attach(address);
    try {
      const name = (await erc20Contract.name()) as string;
      if (!name.trim()) {
        return null;
      }

      const [symbol, decimals] = (await Promise.all([
        erc20Contract.symbol(),
        erc20Contract.decimals(),
      ])) as [string, number];

      // Prevent faulty tokens with empty name/symbol
      if (!symbol.trim()) {
        return null;
      }

      return {
        name,
        symbol,
        decimals,
      };
    } catch (err) {
      // Ignore on purpose; this indicates the probe failed and the address
      // is not a token
      return null;
    }
  };

export const useTokenMetadata = (
  provider: JsonRpcProvider | undefined,
  address: ChecksummedAddress | undefined
): TokenMeta | null | undefined => {
  const fetcher = tokenMetadataFetcher(provider);
  const { data, error } = useSWRImmutable(
    provider !== undefined && address !== undefined
      ? ["tokenmeta", address]
      : null,
    fetcher
  );
  if (error) {
    return undefined;
  }
  return data;
};
