import {
  Contract,
  JsonRpcApiProvider,
  TransactionReceipt,
  TransactionResponse,
  ZeroAddress,
  getAddress,
} from "ethers";
import { useMemo } from "react";
import useSWR, { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import erc20 from "../abi/erc20.json";
import { Match, useSourcifyMetadata } from "../sourcify/useSourcify";
import { ChecksummedAddress } from "../types";
import { providerFetcher, useHasCode } from "../useErigonHooks";
import { formatter } from "../utils/formatter";
import { pageToReverseIdx } from "./pagination";
import { BlockSummary } from "./usePrototypeHooks";

/**
 * All supported transaction search types.
 *
 * Those are NOT arbitrary strings, they are used to compose RPC method
 * names.
 */
export type TransactionSearchType =
  | "ERC20Transfer"
  | "ERC721Transfer"
  | "Withdrawals"
  | "BlocksRewarded";

export type TransactionListResults<T, U = BlockSummary> = {
  blocksSummary: Map<number, U>;
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

export type BlocksRewardedMatch = {
  blockNumber: number;
  totalFees: bigint;
};

type SearchResultsType<T extends TransactionSearchType> =
  T extends "Withdrawals"
    ? WithdrawalMatch
    : T extends "BlocksRewarded"
      ? BlocksRewardedMatch
      : TransactionMatchWithData;

export const useGenericTransactionCount = (
  provider: JsonRpcApiProvider,
  typeName: TransactionSearchType,
  address: ChecksummedAddress,
): number | undefined => {
  const rpcMethod = `ots2_get${typeName}Count`;
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
  typeName: T,
): SearchResultsType<T> {
  if (typeName === "Withdrawals") {
    return {
      index: formatter.bigInt(item.index),
      blockNumber: formatter.number(item.blockNumber),
      validatorIndex: formatter.number(item.validatorIndex),
      amount: formatter.bigInt(item.amount),
    } as SearchResultsType<T>;
  } else if (typeName === "BlocksRewarded") {
    return {
      blockNumber: formatter.number(item.blockNumber),
    } as SearchResultsType<T>;
  } else {
    return {
      hash: item.hash,
      // provider is a JsonRpcApiProvider; fetcher/res would be undefined otherwise
      transaction: new TransactionResponse(
        formatter.transactionResponse(item.transaction),
        provider as JsonRpcApiProvider,
      ),
      receipt: new TransactionReceipt(
        formatter.transactionReceiptParams(item.receipt),
        provider as JsonRpcApiProvider,
      ),
    } as SearchResultsType<T>;
  }
}

const resultFetcher = <T extends TransactionSearchType, U>(
  provider: JsonRpcApiProvider,
  typeName: T,
): Fetcher<
  TransactionListResults<SearchResultsType<T>, U> | undefined,
  [string, ...any]
> => {
  const fetcher = providerFetcher(provider);

  return async (key) => {
    const res = await fetcher(key);
    if (res === undefined) {
      return undefined;
    }

    const converted = (res.results as any[]).map(
      (m): SearchResultsType<T> => decodeResults<T>(m, provider, typeName),
    );
    const blockMap = new Map<number, U>();
    for (const [k, v] of Object.entries(res.blocksSummary as any)) {
      blockMap.set(parseInt(k), v as any);
    }

    return {
      blocksSummary: blockMap,
      results: converted.reverse(),
    };
  };
};

export const useGenericTransactionList = <
  T extends TransactionSearchType,
  U = BlockSummary,
>(
  provider: JsonRpcApiProvider,
  typeName: T,
  address: ChecksummedAddress,
  pageNumber: number,
  pageSize: number,
  total: number | undefined,
): TransactionListResults<SearchResultsType<T>, U> | undefined => {
  const page = pageToReverseIdx(pageNumber, pageSize, total);
  const rpcMethod = `ots2_get${typeName}List`;
  const fetcher = resultFetcher<T, U>(provider, typeName);
  const { data, error } = useSWRImmutable(
    page === undefined ? null : [rpcMethod, address, page.idx, page.count],
    fetcher,
  );
  if (error) {
    return undefined;
  }

  return data;
};

export const useERC1167Impl = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
): ChecksummedAddress | undefined | null => {
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWRImmutable(
    ["ots2_getERC1167Impl", address],
    fetcher,
  );
  if (error) {
    return undefined;
  }
  return data;
};

export const useERC20Holdings = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress,
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
    return (data as any[]).map((m) => getAddress(m.address));
  }, [data, error]);

  return converted;
};

const ERC20_PROTOTYPE = new Contract(ZeroAddress, erc20);

const erc20BalanceFetcher =
  (
    provider: JsonRpcApiProvider,
  ): Fetcher<
    bigint | null,
    ["erc20balance", ChecksummedAddress, ChecksummedAddress]
  > =>
  async ([_, address, tokenAddress]) => {
    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const contract = ERC20_PROTOTYPE.connect(provider).attach(
      tokenAddress,
    ) as Contract;
    return contract.balanceOf(address);
  };

export const useTokenBalance = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
  tokenAddress: ChecksummedAddress | undefined,
): bigint | null | undefined => {
  const fetcher = erc20BalanceFetcher(provider);
  const { data, error } = useSWR(
    ["erc20balance", address, tokenAddress],
    fetcher,
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
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
): AddressAttributes | undefined => {
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWR(
    ["ots2_getAddressAttributes", address],
    fetcher,
  );
  if (address === undefined || error) {
    return undefined;
  }

  if (data === undefined || data === null) {
    return undefined;
  }
  return data;
};

export type ProxyAttributes = {
  proxyType?: string;
  logicAddress?: ChecksummedAddress;
  proxyHasCode?: boolean;
  proxyMatch?: Match | null | undefined;
};

export const useProxyAttributes = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress | undefined,
): ProxyAttributes => {
  const attr = useAddressAttributes(provider, address);
  const proxyType = attr && attr.erc1167 ? "ERC-1167" : undefined;
  const proxyAddress =
    useERC1167Impl(provider, attr && attr.erc1167 ? address : undefined) ??
    undefined;
  const checksummedProxyAddress = proxyAddress
    ? getAddress(proxyAddress)
    : undefined;
  const proxyHasCode = useHasCode(provider, checksummedProxyAddress);
  const proxyMatch = useSourcifyMetadata(
    proxyHasCode ? checksummedProxyAddress : undefined,
    provider._network.chainId,
  );

  return {
    proxyType,
    logicAddress: checksummedProxyAddress,
    proxyHasCode,
    proxyMatch,
  };
};
