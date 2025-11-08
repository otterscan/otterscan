import { Metadata } from "@ethereum-sourcify/lib-sourcify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { hexlify, toUtf8Bytes } from "ethers";
import { useEffect, useState } from "react";

// From @sourcify/lib-sourcify variationsUtils.ts
function reorderAlphabetically(obj: any): any {
  // Do not reorder arrays or other types
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return obj;
  }

  const ordered: any = {};

  Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .forEach((key: string) => {
      ordered[key] = reorderAlphabetically(obj[key]);
    });

  return ordered;
}

class CheckedContractStorage {
  private static storageKeyPrefix: string = "lv";

  static async hashMetadata(metadataObj: Metadata): Promise<string> {
    const digest = await crypto.subtle.digest(
      "sha-256",
      new Uint8Array(
        toUtf8Bytes(JSON.stringify(reorderAlphabetically(metadataObj))),
      ),
    );
    const digestHex = hexlify(new Uint8Array(digest));
    return digestHex;
  }

  /**
   * Saves checked contract information to local storage.
   * @param chainId - The chain ID of the contract.
   * @param address - The address of the contract.
   * @param metadataHash - The metadata hash of the contract.
   */
  static save(
    chainId: string | bigint,
    address: string,
    metadataHash: string,
  ): void {
    const key = this.getKey(chainId, address);
    localStorage.setItem(key, metadataHash);
  }

  /**
   * Retrieves checked contract information from local storage.
   * @param chainId - The chain ID of the contract.
   * @param address - The address of the contract.
   * @returns The contract metadata hash or null if not found.
   */
  static get(chainId: string | bigint, address: string): string | null {
    const key = this.getKey(chainId, address);
    const item = localStorage.getItem(key);
    return item ?? null;
  }

  /**
   * Generates the storage key for a given chain ID and address.
   * @param chainId - The chain ID of the contract.
   * @param address - The address of the contract.
   * @returns The storage key.
   */
  private static getKey(chainId: string | bigint, address: string): string {
    return `${this.storageKeyPrefix}_${chainId}_${address}`;
  }
}

const fetchIsLocallyVerified = async (
  chainId: bigint,
  address: string,
  metadataHash: string,
) => {
  const savedMetadataHash = CheckedContractStorage.get(chainId, address);
  if (savedMetadataHash === metadataHash) {
    return true;
  }
  return false;
};

export const useIsLocallyVerified = (
  match: any,
  chainId: bigint,
  address: string | undefined,
) => {
  const [metadataHash, setMetadataHash] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (match) {
      CheckedContractStorage.hashMetadata(
        match.metadata as unknown as Metadata,
      ).then(setMetadataHash);
    }
  }, [match]);

  const { data: isLocallyVerified, isLoading } = useQuery({
    queryKey: ["locallyVerified", chainId.toString(), address, metadataHash],
    queryFn: () => {
      if (metadataHash !== null && address !== undefined) {
        return fetchIsLocallyVerified(chainId, address, metadataHash);
      }
      return false;
    },
    enabled: metadataHash !== null && address !== undefined,

    // The only advantage to enabling a stale time is if the user locally
    // verifies this contract in another browser tab
    staleTime: Infinity,
  });

  return isLocallyVerified === true;
};

export default CheckedContractStorage;
