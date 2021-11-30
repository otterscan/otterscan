import { useState, useEffect, useMemo } from "react";
import { Interface } from "@ethersproject/abi";
import { ChecksummedAddress, TransactionData } from "../types";
import { sourcifyMetadata, SourcifySource, sourcifySourceFile } from "../url";

export type UserMethod = {
  notice?: string | undefined;
};

export type UserEvent = {
  notice?: string | undefined;
};

export type UserDoc = {
  kind: "user";
  version?: number | undefined;
  notice?: string | undefined;
  methods: Record<string, UserMethod>;
  events: Record<string, UserEvent>;
};

export type DevMethod = {
  params?: Record<string, string>;
  returns?: Record<string, string>;
};

export type DevDoc = {
  kind: "dev";
  version?: number | undefined;
  methods: Record<string, DevMethod>;
};

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
    userdoc?: UserDoc | undefined;
    devdoc?: DevDoc | undefined;
  };
};

const fetchSourcifyMetadata = async (
  address: ChecksummedAddress,
  chainId: number,
  source: SourcifySource,
  abortController: AbortController
): Promise<Metadata | null> => {
  try {
    const metadataURL = sourcifyMetadata(address, chainId, source);
    const result = await fetch(metadataURL, {
      signal: abortController.signal,
    });
    if (result.ok) {
      return await result.json();
    }

    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// TODO: replace every occurrence with the multiple version one
export const useSourcify = (
  address: ChecksummedAddress | undefined,
  chainId: number | undefined,
  source: SourcifySource
): Metadata | null | undefined => {
  const [rawMetadata, setRawMetadata] = useState<Metadata | null | undefined>();

  useEffect(() => {
    if (!address || chainId === undefined) {
      return;
    }
    setRawMetadata(undefined);

    const abortController = new AbortController();
    const fetchMetadata = async () => {
      const _metadata = await fetchSourcifyMetadata(
        address,
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
  }, [address, chainId, source]);

  return rawMetadata;
};

export const useSingleMetadata = (
  address: ChecksummedAddress | undefined,
  chainId: number | undefined,
  source: SourcifySource
) => {
  const addresses = useMemo(() => (address ? [address] : []), [address]);
  const metadatas = useMultipleMetadata(undefined, addresses, chainId, source);
  return address !== undefined ? metadatas[address] : undefined;
};

export const useDedupedAddresses = (
  addresses: (ChecksummedAddress | undefined)[]
): ChecksummedAddress[] => {
  return useMemo(() => {
    const deduped = new Set(
      addresses.filter((a): a is ChecksummedAddress => a !== undefined)
    );
    return [...deduped];
  }, [addresses]);
};

export const useMultipleMetadata = (
  baseMetadatas: Record<string, Metadata | null> | undefined,
  addresses: ChecksummedAddress[] | undefined,
  chainId: number | undefined,
  source: SourcifySource
): Record<ChecksummedAddress, Metadata | null | undefined> => {
  const [rawMetadata, setRawMetadata] = useState<
    Record<string, Metadata | null | undefined>
  >({});
  useEffect(() => {
    if (addresses === undefined || chainId === undefined) {
      return;
    }
    setRawMetadata({});

    const abortController = new AbortController();
    const fetchMetadata = async (_addresses: string[]) => {
      const fetchers: Promise<Metadata | null>[] = [];
      for (const address of _addresses) {
        fetchers.push(
          fetchSourcifyMetadata(address, chainId, source, abortController)
        );
      }

      const results = await Promise.all(fetchers);
      if (abortController.signal.aborted) {
        return;
      }
      let metadatas: Record<string, Metadata | null> = {};
      if (baseMetadatas) {
        metadatas = { ...baseMetadatas };
      }
      for (let i = 0; i < results.length; i++) {
        metadatas[_addresses[i]] = results[i];
      }
      setRawMetadata(metadatas);
    };

    const filtered = addresses.filter((a) => baseMetadatas?.[a] === undefined);
    fetchMetadata(filtered);

    return () => {
      abortController.abort();
    };
  }, [baseMetadatas, addresses, chainId, source]);

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
