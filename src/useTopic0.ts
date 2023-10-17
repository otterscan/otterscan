import { useContext } from "react";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { RuntimeContext } from "./useRuntime";
import { topic0URL } from "./url";

export type Topic0Entry = {
  signatures: string[] | undefined;
};

const topic0Fetcher: Fetcher<Topic0Entry | null | undefined, string> = async (
  signatureURL,
) => {
  try {
    const res = await fetch(signatureURL);
    if (!res.ok) {
      console.error(`Signature does not exist in topic0 DB: ${signatureURL}`);
      return null;
    }

    // Get only the first occurrence, for now ignore alternative param names
    const sig = await res.text();
    const sigs = sig.split(";");
    const entry: Topic0Entry = {
      signatures: sigs,
    };
    return entry;
  } catch (err) {
    console.error(`Couldn't fetch signature URL ${signatureURL}`, err);
    return null;
  }
};

/**
 * Extract topic0 DB info
 *
 * @param rawTopic0 an hex string containing the keccak256 of event signature
 */
export const useTopic0 = (
  rawTopic0: string,
): Topic0Entry | null | undefined => {
  if (rawTopic0.length !== 66 || !rawTopic0.startsWith("0x")) {
    throw new Error(
      `rawTopic0 must contain a 32 bytes hex event signature starting with 0x; received value: "${rawTopic0}"`,
    );
  }

  const runtime = useContext(RuntimeContext);
  const assetsURLPrefix = runtime.config?.assetsURLPrefix;

  const topic0 = rawTopic0.slice(2);
  const signatureURL = () =>
    assetsURLPrefix === undefined ? null : topic0URL(assetsURLPrefix, topic0);
  const { data, error } = useSWRImmutable(signatureURL, topic0Fetcher);
  if (error) {
    return null;
  }
  return data;
};
