import { useState, useEffect, useContext } from "react";
import { BaseProvider } from "@ethersproject/providers";
import { getAddress, isAddress } from "@ethersproject/address";
import useSWRImmutable from "swr/immutable";
import { mainResolver } from "./api/address-resolver";
import { SelectedResolvedName } from "./api/address-resolver/CompositeAddressResolver";
import { RuntimeContext } from "./useRuntime";
import { ChecksummedAddress } from "./types";

export const useAddressOrENS = (
  addressOrName: string,
  urlFixer: (address: ChecksummedAddress) => void
): [
  ChecksummedAddress | undefined,
  boolean | undefined,
  boolean | undefined
] => {
  const { provider } = useContext(RuntimeContext);
  const [checksummedAddress, setChecksummedAddress] = useState<
    ChecksummedAddress | undefined
  >();
  const [isENS, setENS] = useState<boolean>();
  const [error, setError] = useState<boolean>();

  // If it looks like it is an ENS name, try to resolve it
  useEffect(() => {
    // Reset
    setENS(false);
    setError(false);
    setChecksummedAddress(undefined);

    // TODO: handle and offer fallback to bad checksummed addresses
    if (isAddress(addressOrName)) {
      // Normalize to checksummed address
      const _checksummedAddress = getAddress(addressOrName);
      if (_checksummedAddress !== addressOrName) {
        // Request came with a non-checksummed address; fix the URL
        urlFixer(_checksummedAddress);
        return;
      }

      setENS(false);
      setError(false);
      setChecksummedAddress(_checksummedAddress);
      return;
    }

    if (!provider) {
      return;
    }
    const resolveName = async () => {
      const resolvedAddress = await provider.resolveName(addressOrName);
      if (resolvedAddress !== null) {
        setENS(true);
        setError(false);
        setChecksummedAddress(resolvedAddress);
      } else {
        setENS(false);
        setError(true);
        setChecksummedAddress(undefined);
      }
    };
    resolveName();
  }, [provider, addressOrName, urlFixer]);

  return [checksummedAddress, isENS, error];
};

export const useResolvedAddress = (
  provider: BaseProvider | undefined,
  address: ChecksummedAddress
): SelectedResolvedName<any> | undefined => {
  const fetcher = async (
    key: string
  ): Promise<SelectedResolvedName<any> | undefined> => {
    if (!provider) {
      return undefined;
    }
    return mainResolver.resolveAddress(provider, address);
  };

  const { data, error } = useSWRImmutable(address, fetcher);
  if (error) {
    return undefined;
  }
  return data;
};
