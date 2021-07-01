import { BigNumber } from "ethers";

export type ProcessedTransaction = {
  blockNumber: number;
  timestamp: number;
  idx: number;
  hash: string;
  from?: string;
  to?: string;
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
