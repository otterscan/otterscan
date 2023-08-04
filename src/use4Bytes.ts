import { useContext, useMemo } from "react";
import {
  Fragment,
  Interface,
  TransactionDescription,
} from "@ethersproject/abi";
import { BigNumberish } from "@ethersproject/bignumber";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { RuntimeContext } from "./useRuntime";
import { fourBytesURL } from "./url";

export type FourBytesEntry = {
  name: string;
  signature: string | undefined;
};

/**
 * Given a hex input data; extract the method selector
 *
 * @param rawInput Raw tx input including the "0x"
 * @returns the first 4 bytes, including the "0x" or null if the input
 * contains an invalid selector, e.g., txs with 0x00 data; simple transfers (0x)
 * return null as well as it is not a method selector
 */
export const extract4Bytes = (rawInput: string): string | null => {
  if (rawInput.length < 10) {
    return null;
  }
  return rawInput.slice(0, 10);
};

type FourBytesKey = [id: "4bytes", fourBytes: string];
type FourBytesFetcher = Fetcher<
  FourBytesEntry | null | undefined,
  FourBytesKey
>;

const fourBytesFetcher =
  (assetsURLPrefix: string): FourBytesFetcher =>
  async ([_, key]) => {
    if (key === null || key === "0x") {
      return undefined;
    }

    // Handle simple transfers with invalid selector like tx:
    // 0x8bcbdcc1589b5c34c1e55909c8269a411f0267a4fed59a73dd4348cc71addbb9,
    // which contains 0x00 as data
    if (key.length !== 10) {
      return undefined;
    }

    const fourBytes = key.slice(2);
    const signatureURL = fourBytesURL(assetsURLPrefix, fourBytes);

    try {
      const res = await fetch(signatureURL);
      if (!res.ok) {
        console.warn(`Signature does not exist in 4bytes DB: ${fourBytes}`);
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
      // Network error or something wrong with URL config;
      // silence and don't try it again
      return null;
    }
  };

/**
 * Extract 4bytes DB info
 *
 * @param rawFourBytes an hex string containing the 4bytes signature in the "0xXXXXXXXX" format.
 */
export const use4Bytes = (
  rawFourBytes: string | null
): FourBytesEntry | null | undefined => {
  if (rawFourBytes !== null && !rawFourBytes.startsWith("0x")) {
    throw new Error(
      `rawFourBytes must contain a bytes hex string starting with 0x; received value: "${rawFourBytes}"`
    );
  }

  const { config } = useContext(RuntimeContext);
  const assetsURLPrefix = config?.assetsURLPrefix;
  const fourBytesKey = assetsURLPrefix !== undefined ? rawFourBytes : null;

  const fetcher = fourBytesFetcher(assetsURLPrefix!);
  const { data, error } = useSWRImmutable(["4bytes", fourBytesKey], fetcher);
  return error ? undefined : data;
};

export const useMethodSelector = (data: string): [boolean, string, string] => {
  const rawFourBytes = extract4Bytes(data);
  const fourBytesEntry = use4Bytes(rawFourBytes);
  const isSimpleTransfer = data === "0x";
  const methodName = isSimpleTransfer
    ? "transfer"
    : fourBytesEntry?.name ?? rawFourBytes ?? "-";
  const methodTitle = isSimpleTransfer
    ? "ETH Transfer"
    : methodName === rawFourBytes
    ? methodName
    : `${methodName} [${rawFourBytes}]`;

  return [isSimpleTransfer, methodName, methodTitle];
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
    if (
      !fourBytesEntry.signature ||
      data === undefined ||
      value === undefined
    ) {
      return undefined;
    }

    const sig = fourBytesEntry?.signature;
    const functionFragment = Fragment.fromString(`function ${sig}`);
    const intf = new Interface([functionFragment]);
    try {
      return intf.parseTransaction({ data, value });
    } catch {
      return undefined;
    }
  }, [fourBytesEntry, data, value]);

  return txDesc;
};
