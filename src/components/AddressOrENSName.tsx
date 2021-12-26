import React, { useContext } from "react";
import { resolverRendererRegistry } from "../api/address-resolver";
import { useResolvedAddress } from "../useResolvedAddresses";
import { RuntimeContext } from "../useRuntime";
import PlainAddress from "./PlainAddress";

type AddressOrENSNameProps = {
  address: string;
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

  if (!resolvedAddress) {
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

  return renderer(address, resolvedName, linkable, !!dontOverrideColors);
};

export default AddressOrENSName;
