import React from "react";
import { ensResolver, ResolvedAddresses } from "../api/address-resolver";
import PlainAddress from "./PlainAddress";
import ENSName from "./ENSName";

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

  if (resolvedAddress === undefined) {
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
  if (resolver === ensResolver) {
    return (
      <ENSName
        address={address}
        text={text}
        linkable={linkable}
        name={resolvedName}
        dontOverrideColors={dontOverrideColors}
      />
    );
  }

  return <></>;
};

export default AddressOrENSName;
