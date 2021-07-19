import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { getTransactionTransfers } from "./nodeFunctions";
import { TransactionData, Transfer } from "./types";

export const useInternalTransfers = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  txData: TransactionData | undefined
): Transfer[] | undefined => {
  const [intTransfers, setIntTransfers] = useState<Transfer[]>();

  useEffect(() => {
    const traceTransfers = async () => {
      if (!provider || !txData) {
        return;
      }

      const _transfers = await getTransactionTransfers(provider, txData);
      for (const t of _transfers) {
        t.from = provider.formatter.address(t.from);
        t.to = provider.formatter.address(t.to);
        t.value = provider.formatter.bigNumber(t.value);
      }
      setIntTransfers(_transfers);
    };
    traceTransfers();
  }, [provider, txData]);

  return intTransfers;
};
