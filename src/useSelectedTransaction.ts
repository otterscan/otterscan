import { createContext, useContext } from "react";
import { TransactionData } from "./types";

export const SelectedTransactionContext = createContext<
  TransactionData | null | undefined
>(undefined);

export const useSelectedTransaction = () =>
  useContext(SelectedTransactionContext);
