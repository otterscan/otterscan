import { useState, useEffect, useRef, useContext } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getAddress, isAddress } from "@ethersproject/address";
import { batchPopulate, ResolvedAddresses } from "./api/address-resolver";
import { TraceGroup } from "./useErigonHooks";
import { RuntimeContext } from "./useRuntime";
import {
  ChecksummedAddress,
  ProcessedTransaction,
  TransactionData,
} from "./types";

export const useAddressOrENSFromURL = (
  addressOrName: string,
  urlFixer: (address: ChecksummedAddress) => void
): [
  ChecksummedAddress | undefined,
  boolean | undefined,
  boolean | undefined
] => {
  const { provider } = useContext(RuntimeContext);
  const [checksummedAddress, setChecksummedAddress] = useState<
    ChecksummedAddress | undefined
  >();
  const [isENS, setENS] = useState<boolean>();
  const [error, setError] = useState<boolean>();

  // If it looks like it is an ENS name, try to resolve it
  useEffect(() => {
    // TODO: handle and offer fallback to bad checksummed addresses
    if (isAddress(addressOrName)) {
      // Normalize to checksummed address
      const _checksummedAddress = getAddress(addressOrName);
      if (_checksummedAddress !== addressOrName) {
        // Request came with a non-checksummed address; fix the URL
        urlFixer(_checksummedAddress);
        return;
      }

      setENS(false);
      setError(false);
      setChecksummedAddress(_checksummedAddress);
      return;
    }

    if (!provider) {
      return;
    }
    const resolveName = async () => {
      const resolvedAddress = await provider.resolveName(addressOrName);
      if (resolvedAddress !== null) {
        setENS(true);
        setError(false);
        setChecksummedAddress(resolvedAddress);
      } else {
        setENS(false);
        setError(true);
        setChecksummedAddress(undefined);
      }
    };
    resolveName();
  }, [provider, addressOrName, urlFixer]);

  return [checksummedAddress, isENS, error];
};

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
