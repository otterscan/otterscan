import { commify } from "../utils/utils";

export const totalTransactionsFormatter = (total: number) =>
  `A total of ${commify(total)} ${
    total === 1 ? "transaction" : "transactions"
  } found`;

export const totalWithdrawalsFormatter = (total: number) =>
  `A total of ${commify(total)} ${
    total === 1 ? "withdrawal" : "withdrawals"
  } found`;

export const totalContractsFormatter = (total: number) =>
  `A total of ${commify(total)} ${total > 1 ? "contracts" : "contract"} found`;
