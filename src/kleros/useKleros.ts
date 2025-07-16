import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useContext } from "react";
import { ChecksummedAddress } from "../types";
import { RuntimeContext } from "../useRuntime";

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

async function fetchKlerosAddressTags(
  apiUrl: string,
  chainId: string,
  addresses: ChecksummedAddress[]
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

export const getKlerosAddressTagsQuery = (
  enabled: boolean,
  apiUrl: string,
  chainId: bigint | undefined,
  addresses: ChecksummedAddress[]
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

export const useKlerosAddressTags = (
  address: ChecksummedAddress | undefined
): KlerosAddressTag[] | null | undefined => {
  const { config, provider } = useContext(RuntimeContext);
  const klerosConfig = config.kleros;
  
  if (!klerosConfig?.enabled || !address) {
    return null;
  }

  const query = useQuery(
    getKlerosAddressTagsQuery(
      klerosConfig.enabled,
      klerosConfig.apiUrl || "https://scout-api.kleros.link",
      provider._network.chainId,
      [address]
    )
  );

  if (!query.data) {
    return query.data; // undefined or null
  }

  // Extract tags for the specific address
  const addressResponse = query.data.addresses.find(
    (item) => Object.keys(item).some(key => key.toLowerCase() === address.toLowerCase())
  );

  if (!addressResponse) {
    return null;
  }

  // Get the tags for this address (case-insensitive lookup)
  const addressKey = Object.keys(addressResponse).find(
    (key) => key.toLowerCase() === address.toLowerCase()
  );

  return addressKey ? addressResponse[addressKey] : null;
};

// Batch hook for fetching multiple addresses at once (useful for transaction logs)
export const useKlerosAddressTagsBatch = (
  addresses: ChecksummedAddress[]
): Map<ChecksummedAddress, KlerosAddressTag[]> | null => {
  const { config, provider } = useContext(RuntimeContext);
  const klerosConfig = config.kleros;
  
  if (!klerosConfig?.enabled || addresses.length === 0) {
    return null;
  }

  const query = useQuery(
    getKlerosAddressTagsQuery(
      klerosConfig.enabled,
      klerosConfig.apiUrl || "https://scout-api.kleros.link",
      provider._network.chainId,
      addresses
    )
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