import { useState, useEffect, useContext } from "react";
import { RuntimeContext } from "./useRuntime";
import { fourBytesURL } from "./url";

export type FourBytesEntry = {
  name: string;
  signature: string | undefined;
};

const simpleTransfer: FourBytesEntry = {
  name: "Transfer",
  signature: undefined,
};

const fullCache = new Map<string, FourBytesEntry | null>();

export const rawInputTo4Bytes = (rawInput: string) => rawInput.slice(0, 10);

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

    const signatureURL = fourBytesURL(assetsURLPrefix, fourBytes);
    fetch(signatureURL)
      .then(async (res) => {
        if (!res.ok) {
          console.error(`Signature does not exist in 4bytes DB: ${fourBytes}`);
          fullCache.set(fourBytes, null);
          setEntry(null);
          return;
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
        setEntry(entry);
        fullCache.set(fourBytes, entry);
      })
      .catch((err) => {
        console.error(`Couldn't fetch signature URL ${signatureURL}`, err);
        setEntry(null);
        fullCache.set(fourBytes, null);
      });
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
