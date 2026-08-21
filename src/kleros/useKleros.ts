import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { queryClient } from "../queryClient";
import { ChecksummedAddress } from "../types";
import { RuntimeContext } from "../useRuntime";

/** Cache duration for a successful Kleros response (1 hour). */
export const KLEROS_STALE_TIME = 60 * 60 * 1000;

/** Cache duration for a failed/empty Kleros response (30 seconds). */
export const KLEROS_ERROR_STALE_TIME = 30 * 1000;

/** True if a single Kleros tag has both non-empty project_name and name_tag. */
export const hasValidKlerosData = (tag: KlerosAddressTag): boolean => {
  return !!(
    tag.project_name &&
    tag.name_tag &&
    (tag.project_name.trim() !== "" || tag.name_tag.trim() !== "")
  );
};

/** True if the list has at least one tag and the first tag is valid. */
export const hasValidKlerosTags = (
  tags: KlerosAddressTag[] | null | undefined,
): boolean => {
  return !!(tags && tags.length > 0 && hasValidKlerosData(tags[0]));
};

/** Format a concise and human-readable Kleros label (Project: Name). */
export const formatKlerosName = (tag: KlerosAddressTag): string => {
  return `${tag.project_name}: ${tag.name_tag}`;
};

type KlerosConfig = {
  enabled: boolean;
  apiUrl?: string;
};

const DEFAULT_KLEROS_CONFIG: KlerosConfig = {
  enabled: true,
  apiUrl: "https://scout-api.kleros.link",
};

type RawKlerosConfig = { enabled?: boolean; apiUrl?: string } | undefined;

/** Merge optional Kleros config overrides with defaults. */
function getEffectiveKlerosConfig(raw: RawKlerosConfig): KlerosConfig {
  const cfg = raw ?? {};
  return {
    enabled: cfg.enabled ?? DEFAULT_KLEROS_CONFIG.enabled,
    apiUrl: cfg.apiUrl ?? DEFAULT_KLEROS_CONFIG.apiUrl,
  };
}

/** Returns the effective Kleros config from the runtime context. */
function useKlerosConfig(): KlerosConfig {
  const { config } = useContext(RuntimeContext);
  return getEffectiveKlerosConfig(config.externalDataSources?.kleros);
}

export type TokenAttributes = {
  logo_url: string;
  token_symbol: string;
  token_name: string;
  decimals: number;
};

export type KlerosAddressTag = {
  chain_id: string;
  project_name: string;
  name_tag: string;
  public_note: string;
  website_link: string;
  verified_domains: string[];
  token_attributes: TokenAttributes | null;
  data_origin_link: string;
};

export type KlerosAddressResponse = {
  [address: string]: KlerosAddressTag[];
};

export type KlerosResponse = {
  addresses: KlerosAddressResponse[];
};

/** Low-level fetcher for the Kleros address-tags API. */
async function fetchKlerosAddressTags(
  apiUrl: string,
  chainId: string,
  addresses: ChecksummedAddress[],
): Promise<KlerosResponse | null> {
  if (addresses.length === 0) {
    return null;
  }

  try {
    // Always call the upstream API directly; CORS must be enabled server-side
    const endpoint = `${apiUrl}/api/address-tags`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chains: [chainId],
        addresses: addresses,
      }),
    });

    if (!response.ok) {
      console.warn(`Kleros Scout API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn(`Error fetching Kleros address tags: ${err}`);
    return null;
  }
}

/**
 * Microtask batcher that coalesces multiple single-address Kleros lookups
 * within the same render frame into a single batch API request.
 *
 * Keyed by `apiUrl + chainId` so different chains/endpoints never collide.
 */
export class KlerosTagsBatcher {
  private pending = new Set<ChecksummedAddress>();
  private scheduled = false;

  constructor(
    private readonly apiUrl: string,
    private readonly chainId: string,
  ) {}

  /** Register an address to be fetched in the next batch. */
  schedule(address: ChecksummedAddress): void {
    // Skip if the individual cache entry is already fresh
    const existing = queryClient.getQueryState([
      "kleros",
      this.chainId,
      address,
    ]);
    if (existing?.data !== undefined && !existing.isInvalidated) {
      const age = Date.now() - existing.dataUpdatedAt;
      if (age < KLEROS_STALE_TIME) {
        return;
      }
    }

    this.pending.add(address);

    if (!this.scheduled) {
      this.scheduled = true;
      queueMicrotask(() => this.flush());
    }
  }

  /** Flush all pending addresses into one batch fetch. */
  private async flush(): Promise<void> {
    const addresses = Array.from(this.pending);
    this.pending.clear();
    this.scheduled = false;

    if (addresses.length === 0) {
      return;
    }

    const response = await fetchKlerosAddressTags(
      this.apiUrl,
      this.chainId,
      addresses,
    );

    if (!response) {
      // Negative-cache: seed an empty result per address so the cache-reader
      // observer gets a defined value (stopping re-render loops) and the batcher
      // skips re-scheduling until KLEROS_ERROR_STALE_TIME has elapsed.
      const emptyData: KlerosResponse = { addresses: [] };
      // Back-date the entry so it expires after KLEROS_ERROR_STALE_TIME.
      const backdatedAt =
        Date.now() - KLEROS_STALE_TIME + KLEROS_ERROR_STALE_TIME;
      for (const address of addresses) {
        queryClient.setQueryData(["kleros", this.chainId, address], emptyData, {
          updatedAt: backdatedAt,
        });
      }
      return;
    }

    // Seed individual cache entries so each useQuery picks up its data
    for (const address of addresses) {
      const addressEntry = response.addresses.find((item) =>
        Object.keys(item).some(
          (key) => key.toLowerCase() === address.toLowerCase(),
        ),
      );

      const wrappedData: KlerosResponse = {
        addresses: addressEntry ? [addressEntry] : [],
      };

      queryClient.setQueryData(["kleros", this.chainId, address], wrappedData, {
        updatedAt: Date.now(),
      });
    }
  }
}

/** Registry of active batchers keyed by "apiUrl|chainId". */
const batcherRegistry = new Map<string, KlerosTagsBatcher>();

function getBatcher(apiUrl: string, chainId: string): KlerosTagsBatcher {
  const key = `${apiUrl}|${chainId}`;
  let batcher = batcherRegistry.get(key);
  if (!batcher) {
    batcher = new KlerosTagsBatcher(apiUrl, chainId);
    batcherRegistry.set(key, batcher);
  }
  return batcher;
}

/**
 * Query options for the per-address cache reader.
 *
 * `enabled: false` prevents any auto-fetch — the batcher is solely responsible
 * for network calls and seeds the cache via `queryClient.setQueryData`.
 * The `useQuery` observer still re-renders when that data arrives.
 */
export function getCacheReaderQueryOptions(
  chainIdStr: string | undefined,
  address: ChecksummedAddress | undefined,
): UseQueryOptions<KlerosResponse | null> {
  return {
    queryKey: ["kleros", chainIdStr, address],
    queryFn: () => null, // never called; batcher seeds cache via setQueryData
    enabled: false,
  };
}

/** Fetch Kleros tags for a single address. */
export const useKlerosAddressTags = (
  address: ChecksummedAddress | undefined,
): KlerosAddressTag[] | null | undefined => {
  const { provider } = useContext(RuntimeContext);
  const klerosConfig = useKlerosConfig();
  const chainId = provider._network.chainId;
  const chainIdStr = chainId?.toString();

  // Register this address with the batcher so concurrent calls
  // within the same render frame are coalesced into one API request.
  useEffect(() => {
    if (
      !klerosConfig.enabled ||
      !address ||
      !chainIdStr ||
      !klerosConfig.apiUrl
    ) {
      return;
    }
    const batcher = getBatcher(klerosConfig.apiUrl, chainIdStr);
    batcher.schedule(address);
  }, [klerosConfig.enabled, klerosConfig.apiUrl, address, chainIdStr]);

  // Pure cache reader: never auto-fetches. The batcher (above) seeds this
  // query's cache entry; the observer re-renders when setQueryData fires.
  const query = useQuery(getCacheReaderQueryOptions(chainIdStr, address));

  if (address === undefined) {
    return undefined;
  }

  if (!query.data) {
    // undefined or null
    return query.data;
  }

  // Extract tags for the specific address
  const addressResponse = query.data.addresses.find((item) =>
    Object.keys(item).some(
      (key) => key.toLowerCase() === address.toLowerCase(),
    ),
  );

  if (!addressResponse) {
    return null;
  }

  // Get the tags for this address (case-insensitive lookup)
  const addressKey = Object.keys(addressResponse).find(
    (key) => key.toLowerCase() === address.toLowerCase(),
  );

  return addressKey ? addressResponse[addressKey] : null;
};
