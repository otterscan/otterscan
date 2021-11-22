import { useState, useEffect, useRef } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ProcessedTransaction, TransactionData } from "./types";
import { batchPopulate, ResolvedAddresses } from "./api/address-resolver";
import { TraceGroup } from "./useErigonHooks";

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

export const transactionDataCollector =
  (txData: TransactionData | null | undefined): AddressCollector =>
  () => {
    if (!txData) {
      return [];
    }

    const uniqueAddresses = new Set<string>();

    // Standard fields
    uniqueAddresses.add(txData.from);
    if (txData.to) {
      uniqueAddresses.add(txData.to);
    }
    if (txData.confirmedData?.createdContractAddress) {
      uniqueAddresses.add(txData.confirmedData?.createdContractAddress);
    }

    // Dig token transfers
    for (const t of txData.tokenTransfers) {
      uniqueAddresses.add(t.from);
      uniqueAddresses.add(t.to);
      uniqueAddresses.add(t.token);
    }

    // Dig log addresses
    if (txData.confirmedData) {
      for (const l of txData.confirmedData.logs) {
        uniqueAddresses.add(l.address);
        // TODO: find a way to dig over decoded address log attributes
      }
    }

    return Array.from(uniqueAddresses);
  };

export const tracesCollector =
  (traces: TraceGroup[] | undefined): AddressCollector =>
  () => {
    if (traces === undefined) {
      return [];
    }

    const uniqueAddresses = new Set<string>();
    let searchTraces = [...traces];
    while (searchTraces.length > 0) {
      const nextSearch: TraceGroup[] = [];

      for (const g of searchTraces) {
        uniqueAddresses.add(g.from);
        uniqueAddresses.add(g.to);
        if (g.children) {
          nextSearch.push(...g.children);
        }
      }

      searchTraces = nextSearch;
    }
    return Array.from(uniqueAddresses);
  };

export const useResolvedAddresses = (
  provider: JsonRpcProvider | undefined,
  addrCollector: AddressCollector
) => {
  const [names, setNames] = useState<ResolvedAddresses>();
  const ref = useRef<ResolvedAddresses | undefined>();
  useEffect(() => {
    ref.current = names;
  });

  useEffect(
    () => {
      if (!provider) {
        return;
      }

      const populate = async () => {
        const _addresses = addrCollector();
        const _names = await batchPopulate(provider, _addresses, ref.current);
        setNames(_names);
      };
      populate();
    },
    // DON'T put names variables in dependency array; this is intentional; useRef
    [provider, addrCollector]
  );

  return names;
};
