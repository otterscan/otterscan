import { ethers, BigNumber } from "ethers";

export enum ConnectionStatus {
  CONNECTING,
  NOT_ETH_NODE,
  NOT_ERIGON,
  NOT_OTTERSCAN_PATCHED,
  CONNECTED,
}

export type ProcessedTransaction = {
  blockNumber: number;
  timestamp: number;
  miner?: string;
  idx: number;
  hash: string;
  from?: string;
  to?: string;
  createdContractAddress?: string;
  internalMinerInteraction?: boolean;
  value: BigNumber;
  fee: BigNumber;
  gasPrice: BigNumber;
  data: string;
  status: number;
};

export type TransactionChunk = {
  txs: ProcessedTransaction[];
  firstPage: boolean;
  lastPage: boolean;
};

export type ENSReverseCache = {
  [address: string]: string;
};

export type TransactionData = {
  transactionHash: string;
  status: boolean;
  blockNumber: number;
  transactionIndex: number;
  confirmations: number;
  timestamp: number;
  miner?: string;
  from: string;
  to: string;
  createdContractAddress?: string;
  value: BigNumber;
  tokenTransfers: TokenTransfer[];
  tokenMetas: TokenMetas;
  fee: BigNumber;
  gasPrice: BigNumber;
  gasLimit: BigNumber;
  gasUsed: BigNumber;
  gasUsedPerc: number;
  nonce: number;
  data: string;
  logs: ethers.providers.Log[];
};

// The VOID...
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export enum AddressContext {
  FROM,
  TO,
}

export type From = {
  current: string;
  depth: number;
};

export enum TransferType {
  TRANSFER = 0,
  SELF_DESTRUCT = 1,
  CREATE = 2,
  CREATE2 = 3,
}

export type Transfer = {
  type: TransferType;
  from: string;
  to: string;
  value: BigNumber;
};

export type TokenTransfer = {
  token: string;
  from: string;
  to: string;
  value: BigNumber;
};

export type TokenMeta = {
  name: string;
  symbol: string;
  decimals: number;
};

export type TokenMetas = {
  [tokenAddress: string]: TokenMeta;
};
