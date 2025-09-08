import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useContext } from "react";
import { ChecksummedAddress } from "../types";
import { RuntimeContext } from "../useRuntime";

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
    // Use proxy in development, direct API in production
    const isDevelopment = import.meta.env.DEV;
    const endpoint = isDevelopment
      ? "/api/kleros/api/address-tags"
      : `${apiUrl}/api/address-tags`;

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

/** React Query options factory to load Kleros tags for one or more addresses. */
export const getKlerosAddressTagsQuery = (
  enabled: boolean,
  apiUrl: string,
  chainId: bigint | undefined,
  addresses: ChecksummedAddress[],
): UseQueryOptions<KlerosResponse | null> => ({
  queryKey: ["kleros", chainId?.toString(), ...addresses],
  queryFn: () => {
    if (!enabled || !chainId) return null;
    return fetchKlerosAddressTags(apiUrl, chainId.toString(), addresses);
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  enabled: enabled && !!chainId && addresses.length > 0,
});

/** Fetch Kleros tags for a single address. */
export const useKlerosAddressTags = (
  address: ChecksummedAddress | undefined,
): KlerosAddressTag[] | null | undefined => {
  const { provider } = useContext(RuntimeContext);
  const klerosConfig = useKlerosConfig();

  if (!klerosConfig?.enabled || !address) {
    return null;
  }

  const query = useQuery(
    getKlerosAddressTagsQuery(
      klerosConfig.enabled,
      klerosConfig.apiUrl!,
      provider._network.chainId,
      [address],
    ),
  );

  if (!query.data) {
    return query.data; // undefined or null
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

/** Fetch Kleros tags for multiple addresses; useful for lists. */
export const useKlerosAddressTagsBatch = (
  addresses: ChecksummedAddress[],
): Map<ChecksummedAddress, KlerosAddressTag[]> | null => {
  const { provider } = useContext(RuntimeContext);
  const klerosConfig = useKlerosConfig();

  if (!klerosConfig?.enabled || addresses.length === 0) {
    return null;
  }

  const query = useQuery(
    getKlerosAddressTagsQuery(
      klerosConfig.enabled,
      klerosConfig.apiUrl!,
      provider._network.chainId,
      addresses,
    ),
  );

  if (!query.data) {
    return null;
  }

  // Build a map for efficient lookups
  const tagsMap = new Map<ChecksummedAddress, KlerosAddressTag[]>();

  query.data.addresses.forEach((addressObj) => {
    Object.entries(addressObj).forEach(([addr, tags]) => {
      tagsMap.set(addr as ChecksummedAddress, tags);
    });
  });

  return tagsMap;
};
