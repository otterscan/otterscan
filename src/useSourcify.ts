import { useState, useEffect } from "react";
import { sourcifyMetadata, sourcifySourceFile } from "./url";

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

export const useSourcify = (
  checksummedAddress: string | undefined,
  chainId: number | undefined
) => {
  const [rawMetadata, setRawMetadata] = useState<Metadata | null | undefined>();

  useEffect(() => {
    if (!checksummedAddress || chainId === undefined) {
      return;
    }

    const fetchMetadata = async () => {
      try {
        const contractMetadataURL = sourcifyMetadata(
          checksummedAddress,
          chainId
        );
        const result = await fetch(contractMetadataURL);
        if (result.ok) {
          const _metadata = await result.json();
          setRawMetadata(_metadata);
        } else {
          setRawMetadata(null);
        }
      } catch (err) {
        console.error(err);
        setRawMetadata(null);
      }
    };
    fetchMetadata();
  }, [checksummedAddress, chainId]);

  return rawMetadata;
};

export const useContract = (
  checksummedAddress: string,
  networkId: number,
  filename: string,
  source: any
) => {
  const [content, setContent] = useState<string>(source.content);

  useEffect(() => {
    if (source.content) {
      return;
    }

    const readContent = async () => {
      const normalizedFilename = filename.replaceAll("@", "_");
      const url = sourcifySourceFile(
        checksummedAddress,
        networkId,
        normalizedFilename
      );
      const res = await fetch(url);
      if (res.ok) {
        const _content = await res.text();
        setContent(_content);
      }
    };
    readContent();
  }, [checksummedAddress, networkId, filename, source.content]);

  return content;
};
