import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { getTransactionTransfers } from "./nodeFunctions";
import { TransactionData, Transfer } from "./types";

export const useInternalTransfers = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  txData: TransactionData | undefined
) => {
  const [transfers, setTransfers] = useState<Transfer[]>();

  useEffect(() => {
    const traceTransfers = async () => {
      if (!provider || !txData) {
        return;
      }

      const _transfers = await getTransactionTransfers(provider, txData);
      setTransfers(_transfers);
    };
    traceTransfers();
  }, [provider, txData]);

  return transfers;
};
