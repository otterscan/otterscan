import { Metadata } from "@ethereum-sourcify/lib-sourcify";
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

export const useIsLocallyVerified = (
  match: any,
  chainId: bigint,
  address: string | undefined,
) => {
  const [isLocallyVerified, setIsLocallyVerified] = useState<boolean>(false);

  useEffect(() => {
    let matchesLocalVerification = false;
    if (match && address !== undefined) {
      const savedMetadataHash = CheckedContractStorage.get(chainId, address);
      if (savedMetadataHash !== null) {
        CheckedContractStorage.hashMetadata(
          match.metadata as unknown as Metadata,
        ).then((metadataHash) => {
          if (metadataHash === savedMetadataHash) {
            matchesLocalVerification = true;
          } else {
            console.warn(
              "For",
              address,
              "mismatched metadata compared to locally verified: got",
              metadataHash,
              "but locally verified =",
              savedMetadataHash,
            );
          }
        });
      }
    }
    setIsLocallyVerified(matchesLocalVerification);
  }, [match, chainId, address]);

  return isLocallyVerified;
};

export default CheckedContractStorage;
