import { EnsPlugin, JsonRpcApiProvider, getAddress, isAddress } from "ethers";
import { useContext, useEffect, useState } from "react";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { getResolver } from "./api/address-resolver";
import { SelectedResolvedName } from "./api/address-resolver/CompositeAddressResolver";
import { ChecksummedAddress } from "./types";
import { RuntimeContext } from "./useRuntime";

export const useAddressOrENS = (
  addressOrName: string,
  urlFixer: (address: ChecksummedAddress) => void,
): [
  ChecksummedAddress | undefined,
  boolean | undefined,
  boolean | undefined,
] => {
  const { provider } = useContext(RuntimeContext);
  const [checksummedAddress, setChecksummedAddress] = useState<
    ChecksummedAddress | undefined
  >(isAddress(addressOrName) ? addressOrName : undefined);
  const [isENS, setENS] = useState<boolean>();
  const [error, setError] = useState<boolean>();

  // If it looks like it is an ENS name, try to resolve it
  useEffect(() => {
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

    if (
      (
        provider._network.getPlugin(
          "org.ethers.plugins.network.Ens",
        ) as EnsPlugin | null
      )?.address
    ) {
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
    } else {
      setENS(false);
      setError(true);
      setChecksummedAddress(undefined);
    }
  }, [provider, addressOrName, urlFixer]);

  return [checksummedAddress, isENS, error];
};

export const useResolvedAddress = (
  provider: JsonRpcApiProvider,
  address: ChecksummedAddress,
): SelectedResolvedName<any> | undefined => {
  const fetcher: Fetcher<
    SelectedResolvedName<any> | undefined,
    string
  > = async (key) => {
    const resolver = getResolver(provider._network.chainId);
    return resolver.resolveAddress(provider, key);
  };

  const { data, error } = useSWRImmutable(address, fetcher);
  if (error) {
    return undefined;
  }
  return data;
};
