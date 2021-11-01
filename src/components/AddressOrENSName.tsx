import React from "react";
import {
  ResolvedAddresses,
  resolverRendererRegistry,
} from "../api/address-resolver";
import PlainAddress from "./PlainAddress";

type AddressOrENSNameProps = {
  address: string;
  selectedAddress?: string;
  text?: string;
  dontOverrideColors?: boolean;
  resolvedAddresses?: ResolvedAddresses | undefined;
};

const AddressOrENSName: React.FC<AddressOrENSNameProps> = ({
  address,
  selectedAddress,
  text,
  dontOverrideColors,
  resolvedAddresses,
}) => {
  const resolvedAddress = resolvedAddresses?.[address];
  const linkable = address !== selectedAddress;

  if (!resolvedAddress) {
    return (
      <PlainAddress
        address={address}
        text={text}
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
        text={text}
        linkable={linkable}
        dontOverrideColors={dontOverrideColors}
      />
    );
  }

  return renderer(address, resolvedName, linkable, !!dontOverrideColors);
};

export default AddressOrENSName;
