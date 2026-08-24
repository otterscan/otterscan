import { EnsPlugin, JsonRpcApiProvider, getAddress, isAddress } from "ethers";
import { useContext, useEffect, useState } from "react";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { getResolver } from "./api/address-resolver";
import { SelectedResolvedName } from "./api/address-resolver/CompositeAddressResolver";
import {
  isGNSName,
  resolveGNSName,
  supportsGNS,
} from "./api/name-resolver/GNSNameResolver";
import { ChecksummedAddress } from "./types";
import { RuntimeContext } from "./useRuntime";

export type NameResolver = "ENS" | "GNS";

export const useAddressOrName = (
  addressOrName: string,
  urlFixer: (address: ChecksummedAddress) => void,
): [
  ChecksummedAddress | undefined,
  NameResolver | undefined,
  boolean | undefined,
] => {
  const { provider } = useContext(RuntimeContext);
  const [checksummedAddress, setChecksummedAddress] = useState<
    ChecksummedAddress | undefined
  >(isAddress(addressOrName) ? getAddress(addressOrName) : undefined);
  const [nameResolver, setNameResolver] = useState<NameResolver>();
  const [error, setError] = useState<boolean>();

  useEffect(() => {
    let cancelled = false;

    // TODO: handle and offer fallback to bad checksummed addresses
    if (isAddress(addressOrName)) {
      // Normalize to checksummed address
      const _checksummedAddress = getAddress(addressOrName);
      setNameResolver(undefined);
      setError(false);
      setChecksummedAddress(_checksummedAddress);
      if (_checksummedAddress !== addressOrName) {
        // Request came with a non-checksummed address; fix the URL
        urlFixer(_checksummedAddress);
      }
      return;
    }

    setNameResolver(undefined);
    setError(undefined);
    setChecksummedAddress(undefined);

    const resolveName = async () => {
      const gnsName = isGNSName(addressOrName);
      const resolver: NameResolver = gnsName ? "GNS" : "ENS";
      let resolvedAddress: string | null = null;

      try {
        if (gnsName) {
          if (supportsGNS(provider._network.chainId)) {
            resolvedAddress = await resolveGNSName(
              provider,
              provider._network.chainId,
              addressOrName,
            );
          }
        } else if (
          (
            provider._network.getPlugin(
              "org.ethers.plugins.network.Ens",
            ) as EnsPlugin | null
          )?.address
        ) {
          resolvedAddress = await provider.resolveName(addressOrName);
        }
      } catch {
        resolvedAddress = null;
      }

      if (cancelled) {
        return;
      }

      if (resolvedAddress !== null) {
        setNameResolver(resolver);
        setError(false);
        setChecksummedAddress(getAddress(resolvedAddress));
      } else {
        setNameResolver(undefined);
        setError(true);
        setChecksummedAddress(undefined);
      }
    };
    resolveName();

    return () => {
      cancelled = true;
    };
  }, [provider, addressOrName, urlFixer]);

  return [checksummedAddress, nameResolver, error];
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
