import { BigNumber } from "@ethersproject/bignumber";
import { ContractMatch, ContractResultParser } from "./usePrototypeHooks";
import { ChecksummedAddress } from "../types";

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
