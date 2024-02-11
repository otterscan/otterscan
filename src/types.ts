import { Log } from "ethers";

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
  value: bigint;
  fee: bigint;
  gasPrice: bigint;
  data: string;
  status: number;
};

export type TransactionChunk = {
  txs: ProcessedTransaction[];
  firstPage: boolean;
  lastPage: boolean;
};

export type TransactionDescriptionData = {
  value: bigint;
  data: string;
};

export type TransactionData = {
  transactionHash: string;
  from: string;
  to?: string;
  value: bigint;
  type: number;
  maxFeePerGas?: bigint | undefined;
  maxPriorityFeePerGas?: bigint | undefined;
  gasPrice?: bigint;
  gasLimit: bigint;
  nonce: bigint;
  data: string;
  maxFeePerBlobGas?: bigint | undefined;
  blobVersionedHashes?: string[] | undefined;
  confirmedData?: ConfirmedTransactionData | undefined;
};

export type ConfirmedTransactionData = {
  status: boolean;
  blockNumber: number;
  transactionIndex: number;
  confirmations: number;
  createdContractAddress?: string;
  fee: bigint;
  gasUsed: bigint;
  logs: Log[];
  blobGasPrice?: bigint;
  blobGasUsed?: bigint;
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
  value: bigint;
};

export type TokenTransfer = {
  token: string;
  from: string;
  to: string;
  value: bigint;
};

export type TokenMeta = {
  name: string;
  symbol: string;
  decimals: number;
};

export type TokenMetas = Record<string, TokenMeta | null | undefined>;
