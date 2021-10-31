import { useState, useEffect } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ProcessedTransaction, TransactionData } from "./types";
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
