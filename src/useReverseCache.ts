import { useState, useEffect } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ENSReverseCache, ProcessedTransaction } from "./types";

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
      const solvers: Promise<string>[] = [];
      for (const a of addresses) {
        solvers.push(provider.lookupAddress(a));
      }

      const results = await Promise.all(solvers);
      const cache: ENSReverseCache = {};
      for (let i = 0; i < results.length; i++) {
        if (results[i] === null) {
          continue;
        }
        cache[addresses[i]] = results[i];
      }
      setReverseCache(cache);
    };
    reverseResolve();
  }, [provider, page]);

  return reverseCache;
};
