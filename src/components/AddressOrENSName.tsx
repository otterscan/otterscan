import React, { useContext } from "react";
import PlainAddress from "./PlainAddress";
import { resolverRendererRegistry } from "../api/address-resolver";
import { useResolvedAddress } from "../useResolvedAddresses";
import { RuntimeContext } from "../useRuntime";
import { ChecksummedAddress } from "../types";

type AddressOrENSNameProps = {
  address: ChecksummedAddress;
  selectedAddress?: string;
  dontOverrideColors?: boolean;
};

const AddressOrENSName: React.FC<AddressOrENSNameProps> = ({
  address,
  selectedAddress,
  dontOverrideColors,
}) => {
  const { provider } = useContext(RuntimeContext);
  const resolvedAddress = useResolvedAddress(provider, address);
  const linkable = address !== selectedAddress;

  if (!provider || !resolvedAddress) {
    return (
      <PlainAddress
        address={address}
        linkable={linkable}
        dontOverrideColors={dontOverrideColors}
      />
    );
  }

  const [resolver, resolvedName] = resolvedAddress;
  const renderer = resolverRendererRegistry.get(resolver);
  if (renderer === undefined) {
    return (
      <PlainAddress
        address={address}
        linkable={linkable}
        dontOverrideColors={dontOverrideColors}
      />
    );
  }

  return renderer(
    provider.network.chainId,
    address,
    resolvedName,
    linkable,
    !!dontOverrideColors
  );
};

export default AddressOrENSName;
