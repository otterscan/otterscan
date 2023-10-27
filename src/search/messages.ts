import { commify } from "../utils/utils";

export const totalTransactionsFormatter = (total: number) =>
  `A total of ${commify(total)} ${
    total === 1 ? "transaction" : "transactions"
  } found`;

export const totalWithdrawalsFormatter = (total: number) =>
  `A total of ${commify(total)} ${
    total === 1 ? "withdrawal" : "withdrawals"
  } found`;

export const totalBlocksFormatter = (total: number) =>
  `A total of ${commify(total)} ${total === 1 ? "block" : "blocks"} found`;

export const totalContractsFormatter = (total: number) =>
  `A total of ${commify(total)} ${total > 1 ? "contracts" : "contract"} found`;

export const getTotalFormatter = (
  typeName: string,
): ((total: number) => string) => {
  switch (typeName) {
    case "transaction":
      return totalTransactionsFormatter;
    case "withdrawal":
      return totalWithdrawalsFormatter;
    case "contract":
      return totalContractsFormatter;
    case "block":
      return totalBlocksFormatter;
    default:
      return (total: number) => `A total of ${total} found`;
  }
};

