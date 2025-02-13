import { ErrorDescription, Interface } from "ethers";
import { useContext, useMemo } from "react";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { ChecksummedAddress, TransactionDescriptionData } from "../types";
import { useAppConfigContext } from "../useAppConfig";
import { RuntimeContext } from "../useRuntime";

export type UserMethod = {
  notice?: string | undefined;
};

export type UserEvent = {
  notice?: string | undefined;
};

export type UserError = [
  {
    notice?: string | undefined;
  },
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
  details?: string | undefined;
};

export type DevError = [
  {
    params?: Record<string, string>;
  },
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
  settings?: {
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

const SourcifyBackendFormats = ["RepositoryV1", "RepositoryV2"] as const;
type SourcifyBackendFormat = (typeof SourcifyBackendFormats)[number];

export type SourcifySourceName = string;
export type SourcifySource = {
  url: string;
  backendFormat: SourcifyBackendFormat;
};
export const defaultSourcifySourceName: SourcifySourceName = "Sourcify Servers";
export type SourcifySourceMap = { [key: SourcifySourceName]: SourcifySource };

function isSourcifyBackendFormat(
  format: string | undefined,
): format is SourcifyBackendFormat {
  if (format === undefined) {
    return false;
  }
  return SourcifyBackendFormats.includes(format as SourcifyBackendFormat);
}

const sourcifyHttpRepoPrefix = `https://repo.sourcify.dev`;

const defaultSourcifySources = {
  [defaultSourcifySourceName]: {
    url: sourcifyHttpRepoPrefix,
    backendFormat: "RepositoryV2",
  },
};

// TODO: Remove this flag after the migration period has ended.
let sourceDeprecationWarningLogged = false;
export function resolveSourcifySource(
  sourceName: SourcifySourceName | null,
  sourcifySources: SourcifySourceMap,
): { name: SourcifySourceName; sourcifySource: SourcifySource } {
  let evaluatedSourceName: SourcifySourceName;
  if (sourceName === null) {
    if (Object.keys(sourcifySources).length === 0) {
      throw new Error("No Sourcify sources found.");
    }
    // Use default
    evaluatedSourceName = Object.keys(sourcifySources)[0];
  } else {
    evaluatedSourceName = sourceName;
  }

  if (evaluatedSourceName in sourcifySources) {
    const sourcifySource = sourcifySources[evaluatedSourceName];

    // Handle legacy "name": "url" format for a smooth transition from previous config version
    // TODO: Deprecate and later remove this check
    if (typeof sourcifySource === "string") {
      // TODO: Add link to documentation here.
      if (!sourceDeprecationWarningLogged) {
        console.warn(
          `Sourcify source "${evaluatedSourceName}" is configured using an old format. Please update your Otterscan config. See https://docs.otterscan.io/config/options/sourcify for instructions to migrate.`,
        );
        sourceDeprecationWarningLogged = true;
      }
      return {
        name: evaluatedSourceName,
        sourcifySource: {
          url: sourcifySource as string,
          backendFormat: "RepositoryV1",
        },
      };
    }
    return { name: evaluatedSourceName, sourcifySource: sourcifySource };
  } else {
    throw new Error(`Unknown Sourcify source: ${evaluatedSourceName}`);
  }
}

export function useSourcifySources(): SourcifySourceMap {
  const { config } = useContext(RuntimeContext);
  const sources =
    (config.sourcify?.sources as SourcifySourceMap) ?? defaultSourcifySources;
  return sources;
}

/**
 * Builds a complete Sourcify metadata.json URL given the contract address
 * and chain.
 */
export function sourcifyMetadata(
  address: ChecksummedAddress,
  chainId: bigint,
  source: SourcifySourceName,
  type: MatchType,
  sourcifySources: SourcifySourceMap,
): string {
  const { sourcifySource } = resolveSourcifySource(source, sourcifySources);
  return `${sourcifySource.url}/contracts/${
    type === MatchType.FULL_MATCH ? "full_match" : "partial_match"
  }/${chainId}/${address}/metadata.json`;
}

export const sourcifySourceFile = (
  address: ChecksummedAddress,
  chainId: bigint,
  filepath: string,
  source: SourcifySourceName,
  type: MatchType,
  sourcifySources: SourcifySourceMap,
) =>
  `${resolveSourcifySource(source, sourcifySources).sourcifySource.url}/contracts/${
    type === MatchType.FULL_MATCH ? "full_match" : "partial_match"
  }/${chainId}/${address}/sources/${filepath}`;

export enum MatchType {
  FULL_MATCH,
  PARTIAL_MATCH,
  WHATSABI_GUESS,
}

export type Match = {
  type: MatchType;
  metadata: Metadata;
  unknownSelectors?: string[];
};

function sourcifyFetcher(
  sourcifySources: SourcifySourceMap,
): Fetcher<
  Match | null | undefined,
  ["sourcify", ChecksummedAddress, bigint, SourcifySourceName]
> {
  return async ([_, address, chainId, sourcifySourceName]) => {
    // Try full match
    try {
      const url = sourcifyMetadata(
        address,
        chainId,
        sourcifySourceName,
        MatchType.FULL_MATCH,
        sourcifySources,
      );
      const res = await fetch(url);
      if (res.ok) {
        return {
          type: MatchType.FULL_MATCH,
          metadata: await res.json(),
        };
      }
    } catch (err) {
      console.info(
        `error while getting Sourcify full_match metadata: chainId=${chainId} address=${address} err=${err}; falling back to partial_match`,
      );
    }

    // Fallback to try partial match
    try {
      const url = sourcifyMetadata(
        address,
        chainId,
        sourcifySourceName,
        MatchType.PARTIAL_MATCH,
        sourcifySources,
      );
      const res = await fetch(url);
      if (res.ok) {
        return {
          type: MatchType.PARTIAL_MATCH,
          metadata: await res.json(),
        };
      }
    } catch (err) {
      console.warn(
        `error while getting Sourcify partial_match metadata: chainId=${chainId} address=${address} err=${err}`,
      );
    }
    return null;
  };
}

export const useSourcifyMetadata = (
  address: ChecksummedAddress | undefined,
  chainId: bigint | undefined,
): Match | null | undefined => {
  const { sourcifySource } = useAppConfigContext();
  const sourcifySources = useSourcifySources();
  const metadataURL = () =>
    address === undefined || chainId === undefined
      ? null
      : ["sourcify", address, chainId, sourcifySource];
  const fetcher = sourcifyFetcher(sourcifySources);
  const { data, error } = useSWRImmutable<Match | null | undefined>(
    metadataURL,
    fetcher,
  );
  if (error) {
    return null;
  }
  return data;
};

const contractFetcher: Fetcher<string | null, string> = async (url) => {
  const res = await fetch(url);
  if (res.ok) {
    return await res.text();
  }
  return null;
};

export const useContract = (
  checksummedAddress: string,
  networkId: bigint,
  filename: string,
  fileHash: string,
  sourcifySourceName: SourcifySourceName | null,
  type: MatchType,
) => {
  const sources = useSourcifySources();
  const { name, sourcifySource } = resolveSourcifySource(
    sourcifySourceName,
    sources,
  );
  let fetchFilename: string;
  switch (sourcifySource.backendFormat) {
    case "RepositoryV1": {
      fetchFilename = filename.replaceAll(/[:]/g, "_");
      break;
    }
    case "RepositoryV2": {
      fetchFilename = fileHash;
      break;
    }
    default: {
      console.warn(
        `Unknown or unspecified Sourcify backend format (${sourcifySource.backendFormat}) for Sourcify source "${name}". Falling back to RepositoryV1.`,
      );
      fetchFilename = filename.replaceAll(/[:]/g, "_");
    }
  }
  const url = sourcifySourceFile(
    checksummedAddress,
    networkId,
    fetchFilename,
    name,
    type,
    sources,
  );

  const { data, error } = useSWRImmutable(url, contractFetcher);
  if (error) {
    return undefined;
  }
  return data;
};

export const useTransactionDescription = (
  metadata: Metadata | null | undefined,
  txData: TransactionDescriptionData | null | undefined,
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
  output: string | null | undefined,
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
