import { useState, useEffect, useContext } from "react";
import { RuntimeContext } from "./useRuntime";
import { topic0URL } from "./url";

export type Topic0Entry = {
  signatures: string[] | undefined;
};

const fullCache = new Map<string, Topic0Entry | null>();

/**
 * Extract topic0 DB info
 *
 * @param rawTopic0 an hex string containing the keccak256 of event signature
 */
export const useTopic0 = (
  rawTopic0: string
): Topic0Entry | null | undefined => {
  if (rawTopic0.length !== 66 || !rawTopic0.startsWith("0x")) {
    throw new Error(
      `rawTopic0 must contain a 32 bytes hex event signature starting with 0x; received value: "${rawTopic0}"`
    );
  }

  const runtime = useContext(RuntimeContext);
  const assetsURLPrefix = runtime.config?.assetsURLPrefix;

  const topic0 = rawTopic0.slice(2);
  const [entry, setEntry] = useState<Topic0Entry | null | undefined>(
    fullCache.get(topic0)
  );
  useEffect(() => {
    if (assetsURLPrefix === undefined) {
      return;
    }

    const signatureURL = topic0URL(assetsURLPrefix, topic0);
    fetch(signatureURL)
      .then(async (res) => {
        if (!res.ok) {
          console.error(`Signature does not exist in topic0 DB: ${topic0}`);
          fullCache.set(topic0, null);
          setEntry(null);
          return;
        }

        // Get only the first occurrence, for now ignore alternative param names
        const sig = await res.text();
        const sigs = sig.split(";");
        const entry: Topic0Entry = {
          signatures: sigs,
        };
        setEntry(entry);
        fullCache.set(topic0, entry);
      })
      .catch((err) => {
        console.error(`Couldn't fetch signature URL ${signatureURL}`, err);
        setEntry(null);
        fullCache.set(topic0, null);
      });
  }, [topic0, assetsURLPrefix]);

  if (assetsURLPrefix === undefined) {
    return undefined;
  }

  // Try to resolve topic0 name
  if (entry === null || entry === undefined) {
    return entry;
  }

  // Simulates LRU
  // TODO: implement LRU purging
  fullCache.delete(topic0);
  fullCache.set(topic0, entry);
  return entry;
};
