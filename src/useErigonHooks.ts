import {
  AbiCoder,
  BlockParams,
  BlockTag,
  Contract,
  JsonRpcApiProvider,
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
import { getOpFeeData, isOptimisticChain } from "./execution/op-tx-calculation";
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
  totalDifficulty: bigint;
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
    totalDifficulty: formatter.bigInt(_rawBlock.block.totalDifficulty),
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
      let l1GasUsed: bigint | undefined;
      let l1GasPrice: bigint | undefined;
      let l1FeeScalar: string | undefined;
      if (isOptimisticChain(provider._network.chainId)) {
        if (t.type === 126) {
          fee = 0n;
          effectiveGasPrice = 0n;
        } else {
          l1GasUsed = formatter.bigInt(_rawReceipt.l1GasUsed);
          l1GasPrice = formatter.bigInt(_rawReceipt.l1GasPrice);
          l1FeeScalar = _rawReceipt.l1FeeScalar;
          ({ fee, gasPrice: effectiveGasPrice } = getOpFeeData(
            t.type,
            effectiveGasPrice,
            _receipt.gasUsed!,
            l1GasUsed,
            l1GasPrice,
            l1FeeScalar ?? "0",
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
  provider: JsonRpcApiProvider | undefined,
  blockNumber: number | undefined,
  pageNumber: number,
  pageSize: number,
): { data: BlockTransactionsPage | undefined; isLoading: boolean } => {
  const { data, error, isLoading } = useSWRImmutable(
    provider !== undefined && blockNumber !== undefined
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
  provider: JsonRpcApiProvider | undefined,
  blockNumberOrHash: string | undefined,
): { data: ExtendedBlock | null | undefined; isLoading: boolean } => {
  const { data, error, isLoading } = useSWRImmutable(
    provider !== undefined && blockNumberOrHash !== undefined
      ? [provider, blockNumberOrHash]
      : null,
    blockDataFetcher,
    { keepPreviousData: true },
  );
  if (error) {
    return { data: undefined, isLoading: false };
  }
  return { data, isLoading };
};

export const useBlockDataFromTransaction = (
  provider: JsonRpcApiProvider | undefined,
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
  provider: JsonRpcApiProvider | undefined,
  txhash: string,
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

        let fee: bigint;
        let gasPrice: bigint;

        // Handle Optimism-specific values
        let l1GasUsed: bigint | undefined;
        let l1GasPrice: bigint | undefined;
        let l1FeeScalar: string | undefined;
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
            ({ fee, gasPrice } = getOpFeeData(
              _response.type,
              _response.gasPrice!,
              _receipt ? _receipt.gasUsed! : 0n,
              l1GasUsed,
              l1GasPrice,
              l1FeeScalar ?? "0",
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
  txData: TransactionData,
): TokenTransfer[] | undefined => {
  const transfers = useMemo(() => {
    if (!txData.confirmedData) {
      return undefined;
    }

    return txData.confirmedData.logs
      .filter((l) => l.topics.length === 3 && l.topics[0] === TRANSFER_TOPIC)
      .map((l) => ({
        token: l.address,
        from: getAddress(dataSlice(getBytes(l.topics[1]), 12)),
        to: getAddress(dataSlice(getBytes(l.topics[2]), 12)),
        value: BigInt(l.data),
      }));
  }, [txData]);

  return transfers;
};

export const useInternalOperations = (
  provider: JsonRpcApiProvider | undefined,
  txHash: string | undefined,
): InternalOperation[] | undefined => {
  const { data, error } = useSWRImmutable(
    provider !== undefined && txHash !== undefined
      ? ["ots_getInternalOperations", txHash]
      : null,
    providerFetcher(provider),
  );

  const _transfers = useMemo(() => {
    if (provider === undefined || error || data === undefined) {
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
  }, [provider, data]);
  return _transfers;
};

export const useSendsToMiner = (
  provider: JsonRpcApiProvider | undefined,
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

export type TraceEntry = {
  type: string;
  depth: number;
  from: string;
  to: string;
  value: bigint;
  input: string;
};

export type TraceGroup = TraceEntry & {
  children: TraceGroup[] | null;
};

export const useTraceTransaction = (
  provider: JsonRpcApiProvider | undefined,
  txHash: string,
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
      setTraceGroups(traceTree);
    };
    traceTx();
  }, [provider, txHash]);

  return traceGroups;
};

// Error(string)
const ERROR_MESSAGE_SELECTOR = "0x08c379a0";

export const useTransactionError = (
  provider: JsonRpcApiProvider | undefined,
  txHash: string,
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
        const msg = AbiCoder.defaultAbiCoder().decode(
          ["string"],
          "0x" + result.substr(10),
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
  provider: JsonRpcApiProvider | undefined,
  sender: ChecksummedAddress | undefined,
): bigint | undefined => {
  const { data, error } = useSWR(
    provider && sender ? { provider, sender } : null,
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
  provider: JsonRpcApiProvider | undefined,
  sender: ChecksummedAddress | undefined,
  nonce: bigint | undefined,
): string | null | undefined => {
  const { data, error } = useSWR<
    string | null | undefined,
    any,
    TransactionBySenderAndNonceKey | null
  >(
    provider && sender && nonce !== undefined
      ? {
          network: provider._network.chainId,
          sender,
          nonce,
        }
      : null,
    getTransactionBySenderAndNonceFetcher(provider!),
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
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress | undefined,
): ContractCreator | null | undefined => {
  const { data, error } = useSWR<
    ContractCreator | null | undefined,
    any,
    ContractCreatorKey | null
  >(
    provider && address
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

export const useAddressBalance = (
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress | undefined,
): bigint | null | undefined => {
  const [balance, setBalance] = useState<bigint | undefined>();

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
    provider: JsonRpcApiProvider | undefined,
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
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress | undefined,
  blockTag: BlockTag = "latest",
): boolean | undefined => {
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWRImmutable(
    ["ots_hasCode", address, blockTag],
    fetcher,
  );
  if (error) {
    return undefined;
  }
  return data as boolean | undefined;
};

const ERC20_PROTOTYPE = new Contract(ZeroAddress, erc20);

const tokenMetadataFetcher =
  (
    provider: JsonRpcApiProvider | undefined,
  ): Fetcher<TokenMeta | null, ["tokenmeta", ChecksummedAddress]> =>
  async ([_, address]) => {
    if (provider === undefined) {
      return null;
    }

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
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress | undefined,
): TokenMeta | null | undefined => {
  const fetcher = tokenMetadataFetcher(provider);
  const { data, error } = useSWRImmutable(
    provider !== undefined && address !== undefined
      ? ["tokenmeta", address]
      : null,
    fetcher,
  );
  if (error) {
    return undefined;
  }
  return data;
};
