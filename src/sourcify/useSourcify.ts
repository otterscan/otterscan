import { useState, useEffect, useMemo } from "react";
import { Interface } from "@ethersproject/abi";
import { ErrorDescription } from "@ethersproject/abi/lib/interface";
import useSWRImmutable from "swr/immutable";
import { ChecksummedAddress, TransactionData } from "../types";
import { sourcifyMetadata, SourcifySource, sourcifySourceFile } from "../url";

export type UserMethod = {
  notice?: string | undefined;
};

export type UserEvent = {
  notice?: string | undefined;
};

export type UserError = [
  {
    notice?: string | undefined;
  }
];

export type UserDoc = {
  kind: "user";
  version?: number | undefined;
  notice?: string | undefined;
  methods: Record<string, UserMethod>;
  events: Record<string, UserEvent>;
  errors?: Record<string, UserError> | undefined;
};

export type DevMethod = {
  params?: Record<string, string>;
  returns?: Record<string, string>;
};

export type DevError = [
  {
    params?: Record<string, string>;
  }
];

export type DevDoc = {
  kind: "dev";
  version?: number | undefined;
  methods: Record<string, DevMethod>;
  errors?: Record<string, DevError> | undefined;
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

export const useSourcifyMetadata = (
  address: ChecksummedAddress | undefined,
  chainId: number | undefined,
  source: SourcifySource
): Metadata | null | undefined => {
  const metadataURL = () =>
    address === undefined || chainId === undefined
      ? null
      : sourcifyMetadata(address, chainId, source);
  const { data, error } = useSWRImmutable<Metadata>(metadataURL, (url) =>
    fetch(url).then((res) => res.json())
  );
  if (error) {
    return null;
  }
  return data;
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

export const useError = (
  metadata: Metadata | null | undefined,
  output: string | null | undefined
): ErrorDescription | null | undefined => {
  const err = useMemo(() => {
    if (!metadata || !output) {
      return undefined;
    }

    const abi = metadata.output.abi;
    const intf = new Interface(abi as any);
    try {
      return intf.parseError(output);
    } catch (err) {
      console.warn("Couldn't find error signature", err);
      return null;
    }
  }, [metadata, output]);

  return err;
};
