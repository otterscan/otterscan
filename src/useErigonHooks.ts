import { ethers } from "ethers";
import { useState, useEffect } from "react";
import {
  getTransactionSelfDestructs,
  getTransactionTransfers,
} from "./nodeFunctions";
import { InternalTransfers, TransactionData } from "./types";

export const useInternalTransfers = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  txData: TransactionData | undefined
): InternalTransfers | undefined => {
  const [intTransfers, setIntTransfers] = useState<InternalTransfers>();

  useEffect(() => {
    const traceTransfers = async () => {
      if (!provider || !txData) {
        return;
      }

      const _transfers = await getTransactionTransfers(provider, txData);
      const _selfDestructs = await getTransactionSelfDestructs(
        provider,
        txData
      );
      for (const s of _selfDestructs) {
        s.from = provider.formatter.address(s.from);
        s.to = provider.formatter.address(s.to);
        s.value = provider.formatter.bigNumber(s.value);
      }
      setIntTransfers({ transfers: _transfers, selfDestructs: _selfDestructs });
    };
    traceTransfers();
  }, [provider, txData]);

  return intTransfers;
};
