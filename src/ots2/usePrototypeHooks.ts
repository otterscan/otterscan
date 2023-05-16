import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { ChecksummedAddress } from "../types";
import { providerFetcher } from "../useErigonHooks";

export type BlockSummary = {
  blockNumber: number;
  timestamp: number;
};

export type ContractMatch = {
  blockNumber: number;
  address: string;
};

export type ERC20ContractMatch = ContractMatch & {
  name: string;
  symbol: string;
  decimals: number;
};

export type ERC721ContractMatch = ContractMatch & {
  name: string;
  symbol: string;
};

export type ERC1155ContractMatch = ContractMatch & {
  name: string;
  symbol: string;
};

export type ERC1167ContractMatch = ContractMatch & {
  implementation: ChecksummedAddress;
};

export type ERC4626ContractMatch = ERC20ContractMatch & {
  asset: string;
  totalAssets: number;
};

export type ContractListResults<T> = {
  blocksSummary: Map<number, BlockSummary>;
  results: T[];
};

export type ContractResultParser<T> = (e: any) => T;

export const useGenericContractSearch = <T>(
  provider: JsonRpcProvider | undefined,
  t: ContractSearchType,
  pageNumber: number,
  pageSize: number,
  total: number | undefined,
  parser: ContractResultParser<T>
): ContractListResults<T> | undefined => {
  // Calculates the N-th page (1-based) backwards from the total
  // of matches.
  //
  // i.e.: page 1 == [total - pageSize + 1, total]
  let idx = total !== undefined ? total - pageSize * pageNumber + 1 : undefined;
  let count = pageSize;

  // Last page? [1, total % pageSize]
  if (idx !== undefined && total !== undefined && idx < 1) {
    idx = 1;
    count = total % pageSize;
  }

  const rpcMethod = `ots_get${t}List`;
  const fetcher = providerFetcher(provider);
  const { data, error } = useSWR(
    idx === undefined ? null : [rpcMethod, idx, count],
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

export const contractMatchParser: ContractResultParser<ContractMatch> = (
  m
) => ({
  blockNumber: BigNumber.from(m.blockNumber).toNumber(),
  address: m.address,
});

export const erc20MatchParser: ContractResultParser<ERC20ContractMatch> = (
  m
) => ({
  blockNumber: BigNumber.from(m.blockNumber).toNumber(),
  address: m.address,
  name: m.name,
  symbol: m.symbol,
  decimals: m.decimals,
});

export const erc4626MatchParser: ContractResultParser<ERC4626ContractMatch> = (
  m
) => ({
  blockNumber: BigNumber.from(m.blockNumber).toNumber(),
  address: m.address,
  name: m.name,
  symbol: m.symbol,
  decimals: m.decimals,
  asset: m.asset,
  totalAssets: m.totalAssets,
});

export const erc721MatchParser: ContractResultParser<ERC721ContractMatch> = (
  m
) => ({
  blockNumber: BigNumber.from(m.blockNumber).toNumber(),
  address: m.address,
  name: m.name,
  symbol: m.symbol,
});

export const erc1155MatchParser: ContractResultParser<ERC1155ContractMatch> = (
  m
) => ({
  blockNumber: BigNumber.from(m.blockNumber).toNumber(),
  address: m.address,
  name: m.name,
  symbol: m.symbol,
});

export const erc1167MatchParser: ContractResultParser<ERC1167ContractMatch> = (
  m
) => ({
  blockNumber: BigNumber.from(m.blockNumber).toNumber(),
  address: m.address,
  implementation: m.implementation,
});
