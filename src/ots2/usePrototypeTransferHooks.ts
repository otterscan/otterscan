import { useMemo } from "react";
import {
  JsonRpcApiProvider,
  TransactionResponse,
  TransactionReceipt,
  TransactionReceiptParams,
} from "ethers";
import { Contract } from "ethers";
import { ZeroAddress } from "ethers";
import useSWR, { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { ChecksummedAddress } from "../types";
import { providerFetcher } from "../useErigonHooks";
import { BlockSummary } from "./usePrototypeHooks";
import { pageToReverseIdx } from "./pagination";
import erc20 from "../erc20.json";
import { formatter } from "../utils/formatter";

/**
 * All supported transaction search types.
 *
 * Those are NOT arbitrary strings, they are used to compose RPC method
 * names.
 */
export type TransactionSearchType = "ERC20" | "ERC721" | "Withdrawals";

export type TransactionListResults<T> = {
  blocksSummary: Map<number, BlockSummary>;
  results: T[];
};

export type TransactionMatch = {
  hash: string;
};

export type TransactionMatchWithData = TransactionMatch & {
  transaction: TransactionResponse;
  receipt: TransactionReceipt;
};

export type WithdrawalMatch = {
  index: bigint;
  blockNumber: number;
  validatorIndex: number;
  amount: bigint;
};

type returnType<T extends TransactionSearchType> = T extends "Withdrawals"
  ? WithdrawalMatch
  : TransactionMatchWithData;

export const useGenericTransactionCount = (
  provider: JsonRpcApiProvider | undefined,
  t: TransactionSearchType,
  address: ChecksummedAddress
): number | undefined => {
  const transfer = t !== "Withdrawals" ? "Transfer" : "";
  const rpcMethod = `ots2_get${t}${transfer}Count`;
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWRImmutable([rpcMethod, address], fetcher);
  if (error) {
    return undefined;
  }
  return data as number | undefined;
};

function decodeResults<T extends TransactionSearchType>(
  item: any,
  provider: JsonRpcApiProvider,
  t: T
): returnType<T> {
  if (t === "Withdrawals") {
    return {
      index: formatter.bigInt(item.index),
      blockNumber: formatter.number(item.blockNumber),
      validatorIndex: formatter.number(item.validatorIndex),
      amount: formatter.bigInt(item.amount),
    } as returnType<T>;
  } else {
    return {
      hash: item.hash,
      // provider is a JsonRpcApiProvider; fetcher/res would be undefined otherwise
      transaction: new TransactionResponse(
        formatter.transactionResponse(item.transaction),
        provider as JsonRpcApiProvider
      ),
      receipt: new TransactionReceipt(
        formatter.transactionReceiptParams(item.receipt),
        provider as JsonRpcApiProvider
      ),
    } as returnType<T>;
  }
}

const resultFetcher = <T extends TransactionSearchType>(
  provider: JsonRpcApiProvider | undefined,
  t: T
): Fetcher<
  TransactionListResults<returnType<T>> | undefined,
  [string, ...any]
> => {
  const fetcher = providerFetcher(provider);

  return async (key) => {
    const res = await fetcher(key);
    if (res === undefined || provider === undefined) {
      return undefined;
    }

    const converted = (res.results as any[]).map(
      (m): returnType<T> => decodeResults<T>(m, provider, t)
    );
    const blockMap = new Map<number, BlockSummary>();
    for (const [k, v] of Object.entries(res.blocksSummary as any)) {
      blockMap.set(parseInt(k), v as any);
    }

    return {
      blocksSummary: blockMap,
      results: converted.reverse(),
    };
  };
};

export const useGenericTransactionList = <T extends TransactionSearchType>(
  provider: JsonRpcApiProvider | undefined,
  t: T,
  address: ChecksummedAddress,
  pageNumber: number,
  pageSize: number,
  total: number | undefined
): TransactionListResults<returnType<T>> | undefined => {
  const page = pageToReverseIdx(pageNumber, pageSize, total);
  const transfer = t !== "Withdrawals" ? "Transfer" : "";
  const rpcMethod = `ots2_get${t}${transfer}List`;
  const fetcher = resultFetcher<T>(provider, t);
  const { data, error } = useSWRImmutable(
    page === undefined ? null : [rpcMethod, address, page.idx, page.count],
    fetcher
  );
  if (error) {
    return undefined;
  }

  return data;
};

export const useERC1167Impl = (
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress | undefined
): ChecksummedAddress | undefined | null => {
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWRImmutable(
    ["ots2_getERC1167Impl", address],
    fetcher
  );
  if (error) {
    return undefined;
  }
  return data;
};

export const useERC20Holdings = (
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress
): ChecksummedAddress[] | undefined => {
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWR(["ots2_getERC20Holdings", address], fetcher);
  const converted = useMemo(() => {
    if (error) {
      return undefined;
    }

    if (data === undefined || data === null) {
      return undefined;
    }
    return (data as any[]).map((m) => m.address);
  }, [data, error]);

  return converted;
};

const ERC20_PROTOTYPE = new Contract(ZeroAddress, erc20);

const erc20BalanceFetcher =
  (
    provider: JsonRpcApiProvider | undefined
  ): Fetcher<
    bigint | null,
    ["erc20balance", ChecksummedAddress, ChecksummedAddress]
  > =>
  async ([_, address, tokenAddress]) => {
    if (provider === undefined) {
      return null;
    }

    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const contract = ERC20_PROTOTYPE.connect(provider).attach(
      tokenAddress
    ) as Contract;
    return contract.balanceOf(address);
  };

export const useTokenBalance = (
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress | undefined,
  tokenAddress: ChecksummedAddress | undefined
): bigint | null | undefined => {
  const fetcher = erc20BalanceFetcher(provider);
  const { data, error } = useSWR(
    ["erc20balance", address, tokenAddress],
    fetcher
  );
  if (error) {
    return undefined;
  }

  if (data === undefined || data === null) {
    return undefined;
  }
  return data;
};

export type AddressAttributes = {
  erc20?: boolean;
  erc165?: boolean;
  erc721?: boolean;
  erc1155?: boolean;
  erc1167?: boolean;
  erc1167Logic?: boolean;
};

export const useAddressAttributes = (
  provider: JsonRpcApiProvider | undefined,
  address: ChecksummedAddress
): AddressAttributes | undefined => {
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWR(
    ["ots2_getAddressAttributes", address],
    fetcher
  );
  if (error) {
    return undefined;
  }

  if (data === undefined || data === null) {
    return undefined;
  }
  return data;
};
