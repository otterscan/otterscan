import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  AbiCoder,
  BlockParams,
  BlockTag,
  Contract,
  JsonRpcApiProvider,
  Log,
  TransactionReceiptParams,
  TransactionResponseParams,
  ZeroAddress,
  dataSlice,
  getAddress,
  getBytes,
  isHexString,
  toNumber,
} from "ethers";
import { useEffect, useMemo, useState } from "react";
import useSWR, { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import erc20 from "./abi/erc20.json";
import L1Block from "./abi/optimism/L1Block.json";
import { getOpFeeData, isOptimisticChain } from "./execution/op-tx-calculation";
import { panicCodeMessages } from "./execution/panic-codes";
import { type VM } from "./execution/transaction/trace/traceInterpreter";
import {
  ChecksummedAddress,
  InternalOperation,
  OperationType,
  ProcessedTransaction,
  TokenMeta,
  TokenTransfer,
  TransactionData,
} from "./types";
import { formatter } from "./utils/formatter";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export interface ExtendedBlock extends BlockParams {
  blockReward: bigint;
  unclesReward: bigint;
  feeReward: bigint;
  size: number;
  sha3Uncles: string;
  stateRoot: string;
  totalDifficulty?: bigint;
  transactionCount: number;
  // Optimism-specific
  gasUsedDepositTx?: bigint;
}

export const readBlock = async (
  provider: JsonRpcApiProvider,
  blockNumberOrHash: string,
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
  const _block: BlockParams = formatter.blockParams(_rawBlock.block);
  const _rawIssuance = _rawBlock.issuance;

  const extBlock: ExtendedBlock = {
    blockReward: formatter.bigInt(_rawIssuance.blockReward ?? 0),
    unclesReward: formatter.bigInt(_rawIssuance.uncleReward ?? 0),
    feeReward: formatter.bigInt(_rawBlock.totalFees),
    size: formatter.number(_rawBlock.block.size),
    sha3Uncles: _rawBlock.block.sha3Uncles,
    stateRoot: _rawBlock.block.stateRoot,
    totalDifficulty:
      _rawBlock.block.totalDifficulty &&
      formatter.bigInt(_rawBlock.block.totalDifficulty),
    transactionCount: formatter.number(_rawBlock.block.transactionCount),
    // Optimism-specific; gas used by the deposit transaction
    gasUsedDepositTx: formatter.bigInt(_rawBlock.gasUsedDepositTx ?? 0n),
    ..._block,
  };
  return extBlock;
};

export type BlockTransactionsPage = {
  total: number;
  txs: ProcessedTransaction[];
};

const blockTransactionsFetcher: Fetcher<
  BlockTransactionsPage,
  [JsonRpcApiProvider, number, number, number]
> = async ([provider, blockNumber, pageNumber, pageSize]) => {
  const result = await provider.send("ots_getBlockTransactions", [
    blockNumber,
    pageNumber,
    pageSize,
  ]);
  const _block = formatter.blockParamsWithTransactions(result.fullblock);
  const _receipts = result.receipts;

  const rawTxs = _block.transactions
    .map((t: TransactionResponseParams, i: number): ProcessedTransaction => {
      const _rawReceipt = _receipts[i];
      // Empty logs on purpose because of ethers formatter requires it
      _rawReceipt.logs = [];
      const _receipt: TransactionReceiptParams =
        formatter.transactionReceiptParams(_rawReceipt);

      if (t.hash === null) {
        throw new Error("blockTransactionsFetcher: unknown tx hash");
      }

      let fee: bigint;
      let effectiveGasPrice: bigint;
      if (t.type === 2 || t.type === 3) {
        const tip =
          t.maxFeePerGas! - _block.baseFeePerGas! < t.maxPriorityFeePerGas!
            ? t.maxFeePerGas! - _block.baseFeePerGas!
            : t.maxPriorityFeePerGas!;
        effectiveGasPrice = _block.baseFeePerGas! + tip;
      } else {
        effectiveGasPrice = t.gasPrice!;
      }

      // Handle Optimism-specific values
      let l1Fee: bigint | undefined;
      if (isOptimisticChain(provider._network.chainId)) {
        if (t.type === 126) {
          fee = 0n;
          effectiveGasPrice = 0n;
        } else {
          l1Fee = formatter.bigInt(_rawReceipt.l1Fee);
          ({ fee, gasPrice: effectiveGasPrice } = getOpFeeData(
            t.type,
            effectiveGasPrice,
            _receipt.gasUsed!,
            l1Fee,
          ));
        }
      } else {
        fee = formatter.bigInt(_receipt.gasUsed) * effectiveGasPrice;
      }

      return {
        blockNumber: blockNumber,
        timestamp: _block.timestamp,
        miner: _block.miner,
        idx: i,
        hash: t.hash,
        from: t.from ?? undefined,
        to: t.to ?? null,
        createdContractAddress: _receipt.contractAddress ?? undefined,
        value: t.value,
        type: t.type,
        fee,
        gasPrice: effectiveGasPrice,
        data: t.data,
        status: formatter.number(_receipt.status),
      };
    })
    .reverse();

  return { total: result.fullblock.transactionCount, txs: rawTxs };
};

export const useBlockTransactions = (
  provider: JsonRpcApiProvider,
  blockNumber: number | undefined,
  pageNumber: number,
  pageSize: number,
): { data: BlockTransactionsPage | undefined; isLoading: boolean } => {
  const { data, error, isLoading } = useSWRImmutable(
    blockNumber !== undefined
      ? [provider, blockNumber, pageNumber, pageSize]
      : null,
    blockTransactionsFetcher,
    { keepPreviousData: true },
  );
  if (error) {
    return { data: undefined, isLoading: false };
  }
  return { data, isLoading };
};

const blockDataFetcher: Fetcher<
  ExtendedBlock | null,
  [JsonRpcApiProvider, string]
> = async ([provider, blockNumberOrHash]) => {
  return readBlock(provider, blockNumberOrHash);
};

// TODO: some callers may use only block headers?
export const useBlockData = (
  provider: JsonRpcApiProvider,
  blockNumberOrHash: string | undefined,
): { data: ExtendedBlock | null | undefined; isLoading: boolean } => {
  const { data, error, isLoading } = useSWRImmutable(
    blockNumberOrHash !== undefined ? [provider, blockNumberOrHash] : null,
    blockDataFetcher,
    { keepPreviousData: true },
  );
  if (error) {
    return { data: undefined, isLoading: false };
  }
  return { data, isLoading };
};

export const useBlockDataFromTransaction = (
  provider: JsonRpcApiProvider,
  txData: TransactionData | null | undefined,
): ExtendedBlock | null | undefined => {
  const { data: block } = useBlockData(
    provider,
    txData?.confirmedData
      ? txData.confirmedData.blockNumber.toString()
      : undefined,
  );
  return block;
};

export const useTxData = (
  provider: JsonRpcApiProvider,
  txhash: string,
): TransactionData | undefined | null => {
  const [txData, setTxData] = useState<TransactionData | undefined | null>();

  useEffect(() => {
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

        let fee: bigint;
        let gasPrice: bigint;

        // Handle Optimism-specific values
        let l1GasUsed: bigint | undefined;
        let l1GasPrice: bigint | undefined;
        let l1FeeScalar: string | undefined;
        let l1Fee: bigint | undefined;
        if (isOptimisticChain(provider._network.chainId)) {
          if (_response.type === 0x7e) {
            fee = 0n;
            gasPrice = 0n;
          } else {
            const _rawReceipt = await provider.send(
              "eth_getTransactionReceipt",
              [txhash],
            );
            l1GasUsed = formatter.bigInt(_rawReceipt.l1GasUsed);
            l1GasPrice = formatter.bigInt(_rawReceipt.l1GasPrice);
            l1FeeScalar = _rawReceipt.l1FeeScalar;
            l1Fee = formatter.bigInt(_rawReceipt.l1Fee);
            ({ fee, gasPrice } = getOpFeeData(
              _response.type,
              _response.gasPrice!,
              _receipt ? _receipt.gasUsed! : 0n,
              l1Fee,
            ));
          }
        } else {
          fee = _response.gasPrice! * _receipt!.gasUsed!;
          gasPrice = _response.gasPrice!;
        }

        setTxData({
          transactionHash: _response.hash,
          from: _response.from,
          to: _response.to ?? undefined,
          value: _response.value,
          type: _response.type ?? 0,
          maxFeePerGas: _response.maxFeePerGas ?? undefined,
          maxPriorityFeePerGas: _response.maxPriorityFeePerGas ?? undefined,
          gasPrice,
          gasLimit: _response.gasLimit,
          nonce: BigInt(_response.nonce),
          data: _response.data,
          maxFeePerBlobGas: _response.maxFeePerBlobGas ?? undefined,
          blobVersionedHashes: _response.blobVersionedHashes ?? undefined,
          authorizationList: _response.authorizationList ?? undefined,
          confirmedData:
            _receipt === null
              ? undefined
              : {
                  status: _receipt.status === 1,
                  blockNumber: _receipt.blockNumber,
                  transactionIndex: _receipt.index,
                  // TODO: Does awaiting this Promise induce another RPC call?
                  confirmations: await _receipt.confirmations(),
                  createdContractAddress: _receipt.contractAddress ?? undefined,
                  fee,
                  gasUsed: _receipt.gasUsed,
                  logs: Array.from(_receipt.logs),
                  blobGasPrice: _receipt.blobGasPrice ?? undefined,
                  blobGasUsed: _receipt.blobGasUsed ?? undefined,
                  l1GasUsed,
                  l1GasPrice,
                  l1FeeScalar,
                  l1Fee,
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

export const findTokenTransfersInLogs = (
  logs: readonly Log[],
): TokenTransfer[] => {
  return logs
    .filter((l) => l.topics.length === 3 && l.topics[0] === TRANSFER_TOPIC)
    .map((l) => ({
      token: l.address,
      from: getAddress(dataSlice(getBytes(l.topics[1]), 12)),
      to: getAddress(dataSlice(getBytes(l.topics[2]), 12)),
      value: BigInt(l.data),
    }));
};

export const useTokenTransfers = (
  txData?: TransactionData | null,
): TokenTransfer[] | undefined => {
  const transfers = useMemo(() => {
    if (txData === undefined || txData === null) {
      return undefined;
    }
    if (!txData.confirmedData) {
      return undefined;
    }

    return findTokenTransfersInLogs(txData.confirmedData.logs);
  }, [txData]);

  return transfers;
};

export const useInternalOperations = (
  provider: JsonRpcApiProvider,
  txHash: string | undefined,
): InternalOperation[] | undefined => {
  const { data, error } = useSWRImmutable(
    txHash !== undefined ? ["ots_getInternalOperations", txHash] : null,
    providerFetcher(provider),
  );

  const _transfers = useMemo(() => {
    if (error || data === undefined) {
      return undefined;
    }

    const _t: InternalOperation[] = [];
    for (const t of data) {
      _t.push({
        type: t.type,
        from: formatter.address(getAddress(t.from)),
        to: formatter.address(getAddress(t.to)),
        value: formatter.bigInt(t.value),
      });
    }
    return _t;
  }, [data]);
  return _transfers;
};

export const useSendsToMiner = (
  provider: JsonRpcApiProvider,
  txHash: string | undefined,
  miner: string | undefined,
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
        miner === getAddress(op.to),
    ) !== -1;
  return [send, ops];
};

export const getVmTraceQuery = (
  provider: JsonRpcApiProvider,
  txHash: string | null,
): UseQueryOptions<any> => ({
  queryKey: ["vm-trace", txHash],
  queryFn: async () => {
    if (txHash !== null) {
      const results = await provider.send("trace_replayTransaction", [
        txHash,
        ["vmTrace"],
      ]);
      return results.vmTrace as VM;
    } else {
      throw new Error("Transaction hash is null");
    }
  },
  enabled: txHash !== null,
  gcTime: 5 * 60 * 1000,
  // Assume no re-orgs
  staleTime: Infinity,
});

export const useVmTrace = (
  provider: JsonRpcApiProvider,
  txHash: string | null,
): VM | undefined => {
  const [trace, setTrace] = useState<VM | undefined>(undefined);

  useEffect(() => {
    const doTrace = async () => {
      if (txHash !== null) {
        const results = await provider.send("trace_replayTransaction", [
          txHash,
          ["vmTrace"],
        ]);
        setTrace(results.vmTrace as VM);
      }
    };
    doTrace();
  }, [provider, txHash]);

  return trace;
};

export type StateDiffElement = {
  type: string;
  from: string | null;
  to: string | null;

  // "+": new
  // "*": modified
  // "-": removed
  storageChange: string;
};

export type StateDiffGroup = {
  title: string;
  diffs: (StateDiffElement | StateDiffGroup)[];
};

export const useStateDiffTrace = (
  provider: JsonRpcApiProvider,
  txHash: string,
): StateDiffGroup[] | undefined | null => {
  const [traceGroups, setTraceGroups] = useState<
    StateDiffGroup[] | undefined | null
  >();

  useEffect(() => {
    const stateDiffTrace = async () => {
      let results;
      try {
        results = await provider.send("trace_replayTransaction", [
          txHash,
          ["stateDiff"],
        ]);
      } catch (e: any) {
        if (e?.code === "UNSUPPORTED_OPERATION") {
          setTraceGroups(null);
        }
        return;
      }
      const entries: StateDiffGroup[] = [];
      let address: string;
      let highLevelChange: any;

      // Iterate over each address with a state change
      for ([address, highLevelChange] of Object.entries(results.stateDiff)) {
        const sdGroup: StateDiffGroup = {
          title: address,
          diffs: [],
        };
        let changeType: string;
        let changes: any;

        function addChangeType(
          changeType: string,
          changes: any,
        ): StateDiffGroup | StateDiffElement | null {
          if (changes === "=") {
            // No change
            return null;
          }

          if (changeType === "storage") {
            // Create a "storage" subgroup and a subgroup for each storage slot
            let group: StateDiffGroup = {
              title: "storage",
              diffs: [],
            };
            for (const [storageSlot, storageChange] of Object.entries(
              changes,
            )) {
              let storageGroup: StateDiffGroup = {
                title: storageSlot,
                diffs: [],
              };
              let change = addChangeType("storageChange", storageChange);
              if (change !== null) {
                storageGroup.diffs.push(change);
              }
              group.diffs.push(storageGroup);
            }
            return group;
          }

          let storageChanges = Object.keys(changes);
          if (storageChanges.length !== 1) {
            throw new Error("More than one storage change type found");
          }
          // storageChange is "*", "+", or "-"
          let storageChange = storageChanges[0];

          if (storageChange === "+") {
            // Just the new value is stored
            return {
              type: changeType,
              from: null,
              to: changes[storageChange],
              storageChange,
            };
          } else if (storageChange === "-") {
            return {
              type: changeType,
              from: changes[storageChange],
              to: null,
              storageChange,
            };
          }

          return {
            type: changeType,
            from: changes[storageChange].from,
            to: changes[storageChange].to,
            storageChange,
          };
        }

        // Add each of the state changes from this acddress
        for ([changeType, changes] of Object.entries(highLevelChange)) {
          let change = addChangeType(changeType, changes);
          if (change !== null) {
            sdGroup.diffs.push(change);
          }
        }
        entries.push(sdGroup);
      }
      setTraceGroups(entries);
    };
    stateDiffTrace();
  }, [provider, txHash]);
  return traceGroups;
};

export type TraceEntry = {
  type: string;
  depth: number;
  from: string;
  to: string;
  value: bigint;
  input: string;
  output?: string;
};

export type TraceGroup = TraceEntry & {
  children: TraceGroup[] | null;
};

export const getTraceTransactionQuery = (
  provider: JsonRpcApiProvider,
  txHash: string,
): UseQueryOptions<TraceGroup[]> => ({
  queryKey: ["ots_traceTransaction", txHash],
  queryFn: async () => {
    const results = await provider.send("ots_traceTransaction", [txHash]);

    // Implement better formatter
    for (let i = 0; i < results.length; i++) {
      results[i].from = formatter.address(results[i].from);
      results[i].to = formatter.address(results[i].to);
      results[i].value =
        results[i].value === null ? null : formatter.bigInt(results[i].value);
    }

    // Build trace tree
    const buildTraceTree = (
      flatList: TraceEntry[],
      depth: number = 0,
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
    return traceTree;
  },
  // Assume no re-orgs at this point
  staleTime: Infinity,
});

export type TxErrorType = "string" | "panic" | "custom";

// Error(string)
const ERROR_MESSAGE_SELECTOR = "0x08c379a0";
// Panic(uint256)
const PANIC_CODE_SELECTOR = "0x4e487b71";

function intToHex(num: bigint): string {
  return "0x" + num.toString(16).padStart(2, "0");
}

export const useTransactionError = (
  provider: JsonRpcApiProvider,
  txHash: string,
): [string | undefined, string | undefined, TxErrorType | undefined] => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [data, setData] = useState<string | undefined>();
  const [errorType, setErrorType] = useState<TxErrorType | undefined>();

  useEffect(() => {
    // Reset
    setErrorMsg(undefined);
    setData(undefined);
    setErrorType(undefined);

    const readCodes = async () => {
      const result = (await provider.send("ots_getTransactionError", [
        txHash,
      ])) as string | null;

      // Empty or success
      if (result === "0x" || typeof result !== "string") {
        setErrorMsg(undefined);
        setData("0x");
        setErrorType("string");
        return;
      }

      // Filter hardcoded Error(string) selector because ethers don't let us
      // construct it
      const selector = result.substr(0, 10);
      if (selector === ERROR_MESSAGE_SELECTOR) {
        const msg = AbiCoder.defaultAbiCoder().decode(
          ["string"],
          "0x" + result.substr(10),
        );
        setErrorMsg(msg[0]);
        setData(result);
        setErrorType("string");
        return;
      } else if (selector === PANIC_CODE_SELECTOR) {
        const panicCode = AbiCoder.defaultAbiCoder().decode(
          ["uint256"],
          "0x" + result.substr(10),
        );
        let msg = intToHex(panicCode[0]);
        if (panicCode[0].toString() in panicCodeMessages) {
          msg = `${msg}: ${panicCodeMessages[panicCode[0].toString()]}`;
        }
        setErrorMsg(msg);
        setData(result);
        setErrorType("panic");
        return;
      }

      setErrorMsg(undefined);
      setData(result);
      setErrorType("custom");
    };
    readCodes();
  }, [provider, txHash]);

  return [errorMsg, data, errorType];
};

export const useTransactionCount = (
  provider: JsonRpcApiProvider,
  sender: ChecksummedAddress | undefined,
): bigint | undefined => {
  const { data, error } = useSWR(
    sender ? { provider, sender } : null,
    async ({ provider, sender }): Promise<bigint | undefined> =>
      provider.getTransactionCount(sender).then(BigInt),
  );

  if (error) {
    return undefined;
  }
  return data;
};

type TransactionBySenderAndNonceKey = {
  network: bigint;
  sender: ChecksummedAddress;
  nonce: bigint;
};

const getTransactionBySenderAndNonceFetcher =
  (provider: JsonRpcApiProvider) =>
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
      toNumber(nonce),
    ])) as string;

    // Empty or success
    return result;
  };

export const useTransactionBySenderAndNonce = (
  provider: JsonRpcApiProvider,
  sender: ChecksummedAddress | undefined,
  nonce: bigint | undefined,
): string | null | undefined => {
  const { data, error } = useSWR<
    string | null | undefined,
    any,
    TransactionBySenderAndNonceKey | null
  >(
    sender && nonce !== undefined
      ? {
          network: provider._network.chainId,
          sender,
          nonce,
        }
      : null,
    getTransactionBySenderAndNonceFetcher(provider),
  );

  if (error) {
    return undefined;
  }
  return data;
};

type ContractCreatorKey = {
  type: "cc";
  network: bigint;
  address: ChecksummedAddress;
};

type ContractCreator = {
  hash: string;
  creator: ChecksummedAddress;
};

export const useContractCreator = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
): ContractCreator | null | undefined => {
  const { data, error } = useSWR<
    ContractCreator | null | undefined,
    any,
    ContractCreatorKey | null
  >(
    address
      ? {
          type: "cc",
          network: provider._network.chainId,
          address,
        }
      : null,
    getContractCreatorFetcher(provider!),
  );

  if (error) {
    return undefined;
  }
  return data as ContractCreator;
};

const getContractCreatorFetcher =
  (provider: JsonRpcApiProvider) =>
  async ({
    network,
    address,
  }: ContractCreatorKey): Promise<ContractCreator | null | undefined> => {
    const result = (await provider.send("ots_getContractCreator", [
      address,
    ])) as ContractCreator;

    // Empty or success
    if (result) {
      result.creator = formatter.address(result.creator);
    }
    return result;
  };

export const getBalanceQuery = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress,
): UseQueryOptions<bigint> => ({
  queryKey: ["eth_getBalance", address],
  queryFn: () => provider.getBalance(address),
});

/**
 * This is a generic fetch for SWR, where the key is an array, whose
 * element 0 is the JSON-RPC method, and the remaining are the method
 * arguments.
 */
export const providerFetcher =
  (provider: JsonRpcApiProvider): Fetcher<any | undefined, [string, ...any]> =>
  async (key) => {
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
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
  blockTag: BlockTag = "latest",
): boolean | undefined => {
  const { data: hasCode } = useQuery(hasCodeQuery(provider, address, blockTag));
  return hasCode;
};

export const hasCodeQuery = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
  blockTag: BlockTag = "latest",
): UseQueryOptions<boolean> => ({
  queryKey: ["ots_hasCode", address, blockTag],
  queryFn: () => {
    return provider.send("ots_hasCode", [address, blockTag]);
  },
});

export const getCodeQuery = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
  blockTag: BlockTag = "latest",
): UseQueryOptions<string> => ({
  queryKey: ["eth_getCode", address, blockTag],
  queryFn: () => {
    return provider.send("eth_getCode", [address, blockTag]);
  },
});

const ERC20_PROTOTYPE = new Contract(ZeroAddress, erc20);

const tokenMetadataFetcher =
  (
    provider: JsonRpcApiProvider,
  ): Fetcher<TokenMeta | null, ["tokenmeta", ChecksummedAddress]> =>
  async ([_, address]) => {
    // TODO: workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const erc20Contract: Contract = ERC20_PROTOTYPE.connect(provider).attach(
      address,
    ) as Contract;
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
        decimals: Number(decimals),
      };
    } catch (err) {
      // Ignore on purpose; this indicates the probe failed and the address
      // is not a token
      return null;
    }
  };

export const useTokenMetadata = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
): TokenMeta | null | undefined => {
  const fetcher = tokenMetadataFetcher(provider);
  const { data, error } = useSWRImmutable(
    address !== undefined ? ["tokenmeta", address] : null,
    fetcher,
  );
  if (error) {
    return undefined;
  }
  return data;
};

const l1BlockContractAddress = "0x4200000000000000000000000000000000000015";
const L1BLOCK_PROTOTYPE = new Contract(l1BlockContractAddress, L1Block);
const l1EpochFetcher =
  (
    provider: JsonRpcApiProvider,
  ): Fetcher<bigint | null, ["l1epoch", BlockTag]> =>
  async ([_, blockTag]) => {
    // TODO: workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const l1BlockContract: Contract = L1BLOCK_PROTOTYPE.connect(
      provider,
    ).attach(l1BlockContractAddress) as Contract;
    try {
      return l1BlockContract.number({ blockTag });
    } catch (err) {
      return null;
    }
  };

export const useL1Epoch = (
  provider: JsonRpcApiProvider,
  blockTag: BlockTag | null,
): bigint | null | undefined => {
  const fetcher = l1EpochFetcher(provider);
  const key = isOptimisticChain(provider._network.chainId)
    ? ["l1epoch", blockTag]
    : null;
  const { data, error } = useSWRImmutable(key, fetcher);
  return error ? undefined : data;
};
