import { JsonRpcProvider } from "@ethersproject/providers";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { providerFetcher } from "../useErigonHooks";
import { pageToReverseIdx } from "./pagination";

export type BlockSummary = {
  blockNumber: number;
  timestamp: number;
};

export type ContractMatch = {
  blockNumber: number;
  address: string;
};

export type ContractResultParser<T> = (e: any) => T;

export type ContractListResults<T> = {
  blocksSummary: Map<number, BlockSummary>;
  results: T[];
};

/**
 * All supported contract search types.
 *
 * Those are NOT arbitrary strings, they are used to compose RPC method
 * names.
 */
export type ContractSearchType =
  | "AllContracts"
  | "ERC20"
  | "ERC4626"
  | "ERC721"
  | "ERC1155"
  | "ERC1167";

export const useGenericContractSearch = <T extends ContractMatch>(
  provider: JsonRpcProvider | undefined,
  t: ContractSearchType,
  pageNumber: number,
  pageSize: number,
  total: number | undefined,
  parser: ContractResultParser<T>
): ContractListResults<T> | undefined => {
  const page = pageToReverseIdx(pageNumber, pageSize, total);
  const rpcMethod = `ots_get${t}List`;
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWR(
    page === undefined ? null : [rpcMethod, page.idx, page.count],
    fetcher
  );
  if (error) {
    console.error(error);
    return undefined;
  }

  if (data === undefined) {
    return undefined;
  }
  const results = (data.results as any[]).map((m) => parser(m));

  const blockMap = new Map<number, BlockSummary>();
  for (const [k, v] of Object.entries(data.blocksSummary as any)) {
    blockMap.set(parseInt(k), v as any);
  }
  return {
    blocksSummary: blockMap,
    results,
  };
};

export const useGenericContractsCount = (
  provider: JsonRpcProvider | undefined,
  t: ContractSearchType
): number | undefined => {
  const rpcMethod = `ots_get${t}Count`;
  const fetcher = providerFetcher(provider);

  const { data, error } = useSWRImmutable([rpcMethod], fetcher);
  if (error) {
    return undefined;
  }
  return data as number | undefined;
};
