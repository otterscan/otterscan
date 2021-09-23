import { useState, useEffect, useMemo } from "react";
import { Interface } from "@ethersproject/abi";
import { TransactionData } from "./types";
import { sourcifyMetadata, SourcifySource, sourcifySourceFile } from "./url";

export type Metadata = {
  version: string;
  language: string;
  compiler: {
    version: string;
    keccak256?: string | undefined;
  };
  sources: {
    [filename: string]: {
      keccak256: string;
      content?: string | undefined;
      urls?: string[];
      license?: string;
    };
  };
  settings: {
    remappings: string[];
    optimizer?: {
      enabled: boolean;
      runs: number;
    };
    compilationTarget: {
      [filename: string]: string;
    };
    libraries: {
      [filename: string]: string;
    };
  };
  output: {
    abi: any[];
    userdocs: any[];
    devdoc: any[];
  };
};

export const fetchSourcifyMetadata = async (
  checksummedAddress: string,
  chainId: number,
  source: SourcifySource,
  abortController: AbortController
): Promise<Metadata | null> => {
  try {
    const contractMetadataURL = sourcifyMetadata(
      checksummedAddress,
      chainId,
      source
    );
    const result = await fetch(contractMetadataURL, {
      signal: abortController.signal,
    });
    if (result.ok) {
      const _metadata = await result.json();
      return _metadata;
    }

    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const useSourcify = (
  checksummedAddress: string | undefined,
  chainId: number | undefined,
  source: SourcifySource
): Metadata | null | undefined => {
  const [rawMetadata, setRawMetadata] = useState<Metadata | null | undefined>();

  useEffect(() => {
    if (!checksummedAddress || chainId === undefined) {
      return;
    }
    setRawMetadata(undefined);

    const abortController = new AbortController();
    const fetchMetadata = async () => {
      const _metadata = await fetchSourcifyMetadata(
        checksummedAddress,
        chainId,
        source,
        abortController
      );
      setRawMetadata(_metadata);
    };
    fetchMetadata();

    return () => {
      abortController.abort();
    };
  }, [checksummedAddress, chainId, source]);

  return rawMetadata;
};

export const useMultipleMetadata = (
  baseMetadatas: Record<string, Metadata | null>,
  checksummedAddress: (string | undefined)[],
  chainId: number | undefined,
  source: SourcifySource
): Record<string, Metadata | null | undefined> => {
  const [rawMetadata, setRawMetadata] = useState<
    Record<string, Metadata | null | undefined>
  >({});

  useEffect(() => {
    if (!checksummedAddress || chainId === undefined) {
      return;
    }
    setRawMetadata({});

    const abortController = new AbortController();
    const fetchMetadata = async (addresses: string[]) => {
      const promises: Promise<Metadata | null>[] = [];
      for (const addr of addresses) {
        promises.push(
          fetchSourcifyMetadata(addr, chainId, source, abortController)
        );
      }

      const results = await Promise.all(promises);
      const metadatas: Record<string, Metadata | null> = { ...baseMetadatas };
      for (let i = 0; i < results.length; i++) {
        metadatas[addresses[i]] = results[i];
      }
      setRawMetadata(metadatas);
    };

    const deduped = new Set(
      checksummedAddress.filter(
        (a): a is string => a !== undefined && baseMetadatas[a] === undefined
      )
    );
    fetchMetadata(Array.from(deduped));

    return () => {
      abortController.abort();
    };
  }, [baseMetadatas, checksummedAddress, chainId, source]);

  return rawMetadata;
};

export const useContract = (
  checksummedAddress: string,
  networkId: number,
  filename: string,
  source: any,
  sourcifySource: SourcifySource
) => {
  const [content, setContent] = useState<string>(source.content);

  useEffect(() => {
    if (source.content) {
      return;
    }

    const abortController = new AbortController();
    const readContent = async () => {
      const normalizedFilename = filename.replaceAll(/[@:]/g, "_");
      const url = sourcifySourceFile(
        checksummedAddress,
        networkId,
        normalizedFilename,
        sourcifySource
      );
      const res = await fetch(url, { signal: abortController.signal });
      if (res.ok) {
        const _content = await res.text();
        setContent(_content);
      }
    };
    readContent();

    return () => {
      abortController.abort();
    };
  }, [checksummedAddress, networkId, filename, source.content, sourcifySource]);

  return content;
};

export const useTransactionDescription = (
  metadata: Metadata | null | undefined,
  txData: TransactionData | null | undefined
) => {
  const txDesc = useMemo(() => {
    if (metadata === null) {
      return null;
    }
    if (!metadata || !txData) {
      return undefined;
    }

    const abi = metadata.output.abi;
    const intf = new Interface(abi as any);
    try {
      return intf.parseTransaction({
        data: txData.data,
        value: txData.value,
      });
    } catch (err) {
      console.warn("Couldn't find function signature", err);
      return null;
    }
  }, [metadata, txData]);

  return txDesc;
};
