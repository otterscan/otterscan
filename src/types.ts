import { BigNumber } from "@ethersproject/bignumber";
import { Log } from "@ethersproject/providers";

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
  to: string | null;
  createdContractAddress?: string;
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

export type TransactionData = {
  transactionHash: string;
  from: string;
  to?: string;
  value: BigNumber;
  type: number;
  maxFeePerGas?: BigNumber | undefined;
  maxPriorityFeePerGas?: BigNumber | undefined;
  gasPrice: BigNumber;
  gasLimit: BigNumber;
  nonce: number;
  data: string;
  confirmedData?: ConfirmedTransactionData | undefined;
};

export type ConfirmedTransactionData = {
  status: boolean;
  blockNumber: number;
  transactionIndex: number;
  confirmations: number;
  createdContractAddress?: string;
  fee: BigNumber;
  gasUsed: BigNumber;
  logs: Log[];
  l1GasUsed?: BigNumber | undefined;
  l1GasPrice?: BigNumber | undefined;
  l1FeeScalar?: number | undefined;
};

// The VOID...
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// TODO: replace all occurrences of plain string
export type ChecksummedAddress = string;

export enum AddressContext {
  FROM,
  TO,
}

export type From = {
  current: string;
  depth: number;
};

export enum OperationType {
  TRANSFER = 0,
  SELF_DESTRUCT = 1,
  CREATE = 2,
  CREATE2 = 3,
}

export type InternalOperation = {
  type: OperationType;
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

export type TokenMetas = Record<string, TokenMeta | null | undefined>;
