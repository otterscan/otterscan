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
export type TransactionSearchType = "ERC20" | "ERC721";

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

export const useGenericTransactionCount = (
  provider: JsonRpcApiProvider | undefined,
  t: TransactionSearchType,
  address: ChecksummedAddress
): number | undefined => {
  const rpcMethod = `ots_get${t}TransferCount`;
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWRImmutable([rpcMethod, address], fetcher);
  if (error) {
    return undefined;
  }
  return data as number | undefined;
};

const resultFetcher = (
  provider: JsonRpcApiProvider | undefined
): Fetcher<
  TransactionListResults<TransactionMatchWithData> | undefined,
  [string, ...any]
> => {
  const fetcher = providerFetcher(provider);

  return async (key) => {
    const res = await fetcher(key);
    if (res === undefined) {
      return undefined;
    }

    const converted = (res.results as any[]).map(
      (m): TransactionMatchWithData => ({
        hash: m.hash,
        // provider is a JsonRpcApiProvider; fetcher/res would be undefined otherwise
        transaction: new TransactionResponse(
          formatter.transactionResponse(m.transaction),
          provider as JsonRpcApiProvider
        ),
        receipt: new TransactionReceipt(
          formatter.transactionReceiptParams(m.receipt),
          provider as JsonRpcApiProvider
        ),
      })
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

export const useGenericTransactionList = (
  provider: JsonRpcApiProvider | undefined,
  t: TransactionSearchType,
  address: ChecksummedAddress,
  pageNumber: number,
  pageSize: number,
  total: number | undefined
): TransactionListResults<TransactionMatchWithData> | undefined => {
  const page = pageToReverseIdx(pageNumber, pageSize, total);
  const rpcMethod = `ots_get${t}TransferList`;
  const fetcher = resultFetcher(provider);
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
    ["ots_getERC1167Impl", address],
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
  const { data, error } = useSWR(["ots_getERC20Holdings", address], fetcher);
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
    ["ots_getAddressAttributes", address],
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
