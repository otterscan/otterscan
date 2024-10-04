import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
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

export enum SourcifySource {
  // Resolve trusted IPNS for root IPFS
  IPFS_IPNS = "ipfs",

  // Centralized Sourcify servers
  CENTRAL_SERVER = "central_server",
}

export type SourcifySourceMap = { [key: string]: string };

const SourcifyBackendFormats = ["RepositoryV1", "RepositoryV2"] as const;
type SourcifyBackendFormat = (typeof SourcifyBackendFormats)[number];

function isSourcifyBackendFormat(
  format: string | undefined,
): format is SourcifyBackendFormat {
  if (format === undefined) {
    return false;
  }
  return SourcifyBackendFormats.includes(format as SourcifyBackendFormat);
}

const sourcifyIPNS = "repo.sourcify.dev";
const defaultIpfsGatewayPrefix = `https://ipfs.io/ipns/${sourcifyIPNS}`;
const sourcifyHttpRepoPrefix = `https://repo.sourcify.dev`;

const defaultSourcifySources = {
  [SourcifySource.IPFS_IPNS]: defaultIpfsGatewayPrefix,
  [SourcifySource.CENTRAL_SERVER]: sourcifyHttpRepoPrefix,
};

function resolveSourcifySource(
  source: SourcifySource,
  sourcifySources: SourcifySourceMap,
): string {
  if (source in sourcifySources) {
    return sourcifySources[source];
  } else {
    throw new Error(`Unknown Sourcify integration source code: ${source}`);
  }
}

export function useSourcifySources(): {
  sources: SourcifySourceMap;
  backendFormat: SourcifyBackendFormat;
} {
  const { config } = useContext(RuntimeContext);
  const sources = config.sourcify?.sources ?? defaultSourcifySources;
  let backendFormat: SourcifyBackendFormat = "RepositoryV1";
  const configFormat = config.sourcify?.backendFormat;
  if (isSourcifyBackendFormat(configFormat)) {
    backendFormat = configFormat;
  }
  return { sources, backendFormat };
}

/**
 * Builds a complete Sourcify metadata.json URL given the contract address
 * and chain.
 */
export const sourcifyMetadata = (
  address: ChecksummedAddress,
  chainId: bigint,
  source: SourcifySource,
  type: MatchType,
  sourcifySources: SourcifySourceMap,
) =>
  `${resolveSourcifySource(source, sourcifySources)}/contracts/${
    type === MatchType.FULL_MATCH ? "full_match" : "partial_match"
  }/${chainId}/${address}/metadata.json`;

export const sourcifySourceFile = (
  address: ChecksummedAddress,
  chainId: bigint,
  filepath: string,
  source: SourcifySource,
  type: MatchType,
  sourcifySources: SourcifySourceMap,
) =>
  `${resolveSourcifySource(source, sourcifySources)}/contracts/${
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

async function fetchSourcifyMetadata(
  sourcifySources: SourcifySourceMap,
  sourcifySource: SourcifySource,
  address: ChecksummedAddress | undefined,
  chainId: bigint | undefined,
): Promise<Match | null> {
  if (address === undefined || chainId === undefined) {
    return null;
  }
  // Try full match
  try {
    const url = sourcifyMetadata(
      address,
      chainId,
      sourcifySource,
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
      sourcifySource,
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
}

function sourcifyFetcher(
  sourcifySources: SourcifySourceMap,
): Fetcher<
  Match | null | undefined,
  ["sourcify", ChecksummedAddress, bigint, SourcifySource]
> {
  return async ([_, address, chainId, sourcifySource]) =>
    fetchSourcifyMetadata(sourcifySources, sourcifySource, address, chainId);
}

export const useSourcifyMetadata = (
  address: ChecksummedAddress | undefined,
  chainId: bigint | undefined,
): Match | null | undefined => {
  const { sourcifySource } = useAppConfigContext();
  const { sources: sourcifySources } = useSourcifySources();
  return useQuery(
    getSourcifyMetadataQuery(sourcifySources, sourcifySource, address, chainId),
  ).data;
};

export const getSourcifyMetadataQuery = (
  sourcifySources: SourcifySourceMap,
  sourcifySource: SourcifySource,
  address: ChecksummedAddress | undefined,
  chainId: bigint | undefined,
): UseQueryOptions<Match | null> => ({
  queryKey: ["sourcify", address, (chainId ?? "").toString(), sourcifySource],
  queryFn: () =>
    fetchSourcifyMetadata(sourcifySources, sourcifySource, address, chainId),
  staleTime: Infinity,
  gcTime: 10 * 60 * 1000,
});

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
  sourcifySource: SourcifySource,
  type: MatchType,
) => {
  const { sources, backendFormat } = useSourcifySources();
  let fetchFilename: string;
  switch (backendFormat) {
    case "RepositoryV1": {
      fetchFilename = filename.replaceAll(/[:]/g, "_");
      break;
    }
    case "RepositoryV2": {
      // TODO: Revisit whether all such sources should be assumed to be Solidity files
      fetchFilename = fileHash + ".sol";
      break;
    }
  }
  const url = sourcifySourceFile(
    checksummedAddress,
    networkId,
    fetchFilename,
    sourcifySource,
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
