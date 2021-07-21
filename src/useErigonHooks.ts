import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { getInternalOperations } from "./nodeFunctions";
import { TransactionData, InternalOperation } from "./types";

export const useInternalOperations = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  txData: TransactionData | undefined
): InternalOperation[] | undefined => {
  const [intTransfers, setIntTransfers] = useState<InternalOperation[]>();

  useEffect(() => {
    const traceTransfers = async () => {
      if (!provider || !txData) {
        return;
      }

      const _transfers = await getInternalOperations(provider, txData);
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
