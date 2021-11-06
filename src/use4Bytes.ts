import { useState, useEffect, useContext, useMemo } from "react";
import {
  Fragment,
  Interface,
  TransactionDescription,
} from "@ethersproject/abi";
import { RuntimeContext } from "./useRuntime";
import { fourBytesURL } from "./url";
import { BigNumberish } from "@ethersproject/bignumber";

export type FourBytesEntry = {
  name: string;
  signature: string | undefined;
};

export type FourBytesMap = Record<string, FourBytesEntry | null | undefined>;

const simpleTransfer: FourBytesEntry = {
  name: "Transfer",
  signature: undefined,
};

const fullCache = new Map<string, FourBytesEntry | null>();

export const extract4Bytes = (rawInput: string): string | null => {
  if (rawInput.length < 10) {
    return null;
  }
  return rawInput.slice(0, 10);
};

export const rawInputTo4Bytes = (rawInput: string) => rawInput.slice(0, 10);

const fetch4Bytes = async (
  assetsURLPrefix: string,
  fourBytes: string
): Promise<FourBytesEntry | null> => {
  const signatureURL = fourBytesURL(assetsURLPrefix, fourBytes);

  try {
    const res = await fetch(signatureURL);
    if (!res.ok) {
      console.error(`Signature does not exist in 4bytes DB: ${fourBytes}`);
      return null;
    }

    // Get only the first occurrence, for now ignore alternative param names
    const sigs = await res.text();
    const sig = sigs.split(";")[0];
    const cut = sig.indexOf("(");
    const method = sig.slice(0, cut);

    const entry: FourBytesEntry = {
      name: method,
      signature: sig,
    };
    return entry;
  } catch (err) {
    console.error(`Couldn't fetch signature URL ${signatureURL}`, err);
    return null;
  }
};

export const useBatch4Bytes = (
  rawFourByteSigs: string[] | undefined
): FourBytesMap => {
  const runtime = useContext(RuntimeContext);
  const assetsURLPrefix = runtime.config?.assetsURLPrefix;

  const [fourBytesMap, setFourBytesMap] = useState<FourBytesMap>({});
  useEffect(() => {
    if (!rawFourByteSigs || !assetsURLPrefix) {
      setFourBytesMap({});
      return;
    }

    const loadSigs = async () => {
      const promises = rawFourByteSigs.map((s) =>
        fetch4Bytes(assetsURLPrefix, s.slice(2))
      );
      const results = await Promise.all(promises);

      const _fourBytesMap: Record<string, FourBytesEntry | null> = {};
      for (let i = 0; i < rawFourByteSigs.length; i++) {
        _fourBytesMap[rawFourByteSigs[i]] = results[i];
      }
      setFourBytesMap(_fourBytesMap);
    };
    loadSigs();
  }, [assetsURLPrefix, rawFourByteSigs]);

  return fourBytesMap;
};

/**
 * Extract 4bytes DB info
 *
 * @param rawFourBytes an hex string containing the 4bytes signature in the "0xXXXXXXXX" format.
 */
export const use4Bytes = (
  rawFourBytes: string
): FourBytesEntry | null | undefined => {
  if (rawFourBytes !== "0x") {
    if (rawFourBytes.length !== 10 || !rawFourBytes.startsWith("0x")) {
      throw new Error(
        `rawFourBytes must contain a 4 bytes hex method signature starting with 0x; received value: "${rawFourBytes}"`
      );
    }
  }

  const runtime = useContext(RuntimeContext);
  const assetsURLPrefix = runtime.config?.assetsURLPrefix;

  const fourBytes = rawFourBytes.slice(2);
  const [entry, setEntry] = useState<FourBytesEntry | null | undefined>(
    fullCache.get(fourBytes)
  );
  useEffect(() => {
    if (assetsURLPrefix === undefined) {
      return;
    }
    if (fourBytes === "") {
      return;
    }

    const loadSig = async () => {
      const entry = await fetch4Bytes(assetsURLPrefix, fourBytes);
      fullCache.set(fourBytes, entry);
      setEntry(entry);
    };
    loadSig();
  }, [fourBytes, assetsURLPrefix]);

  if (rawFourBytes === "0x") {
    return simpleTransfer;
  }
  if (assetsURLPrefix === undefined) {
    return undefined;
  }

  // Try to resolve 4bytes name
  if (entry === null || entry === undefined) {
    return entry;
  }

  // Simulates LRU
  // TODO: implement LRU purging
  fullCache.delete(fourBytes);
  fullCache.set(fourBytes, entry);
  return entry;
};

export const useTransactionDescription = (
  fourBytesEntry: FourBytesEntry | null | undefined,
  data: string | undefined,
  value: BigNumberish | undefined
): TransactionDescription | null | undefined => {
  const txDesc = useMemo(() => {
    if (!fourBytesEntry) {
      return fourBytesEntry;
    }
    if (!fourBytesEntry.signature || !data || !value) {
      return undefined;
    }

    const sig = fourBytesEntry?.signature;
    const functionFragment = Fragment.fromString(`function ${sig}`);
    const intf = new Interface([functionFragment]);
    return intf.parseTransaction({ data, value });
  }, [fourBytesEntry, data, value]);

  return txDesc;
};
