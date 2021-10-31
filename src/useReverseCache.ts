import { useState, useEffect } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ProcessedTransaction } from "./types";
import { batchPopulate, ENSReverseCache } from "./api/address-resolver";

export const useENSCache = (
  provider?: JsonRpcProvider,
  page?: ProcessedTransaction[]
) => {
  const [reverseCache, setReverseCache] = useState<ENSReverseCache>();

  useEffect(() => {
    if (!provider || !page) {
      return;
    }

    const addrSet = new Set<string>();
    for (const tx of page) {
      if (tx.from) {
        addrSet.add(tx.from);
      }
      if (tx.to) {
        addrSet.add(tx.to);
      }
    }
    const addresses = Array.from(addrSet);

    const reverseResolve = async () => {
      const cache = await batchPopulate(provider, addresses);
      setReverseCache(cache);
    };
    reverseResolve();
  }, [provider, page]);

  return reverseCache;
};
