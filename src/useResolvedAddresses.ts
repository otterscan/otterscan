import { useState, useEffect } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ProcessedTransaction } from "./types";
import { batchPopulate, ResolvedAddresses } from "./api/address-resolver";

export type AddressCollector = () => string[];

export const pageCollector =
  (page: ProcessedTransaction[] | undefined): AddressCollector =>
  () => {
    if (!page) {
      return [];
    }

    const uniqueAddresses = new Set<string>();
    for (const tx of page) {
      if (tx.from) {
        uniqueAddresses.add(tx.from);
      }
      if (tx.to) {
        uniqueAddresses.add(tx.to);
      }
    }

    return Array.from(uniqueAddresses);
  };

export const useResolvedAddresses = (
  provider: JsonRpcProvider | undefined,
  addrCollector: AddressCollector
) => {
  const [names, setNames] = useState<ResolvedAddresses>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    const populate = async () => {
      const _addresses = addrCollector();
      const _names = await batchPopulate(provider, _addresses);
      setNames(_names);
    };
    populate();
  }, [provider, addrCollector]);

  return names;
};
