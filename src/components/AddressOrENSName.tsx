import React from "react";
import Address from "./Address";
import AddressLink from "./AddressLink";
import ENSName from "./ENSName";
import ENSNameLink from "./ENSNameLink";
import { ensResolver, ResolvedAddresses } from "../api/address-resolver";

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
  const name = resolvedAddresses?.[address];
  return (
    <>
      {address === selectedAddress ? (
        <>
          {name?.[0] === ensResolver ? (
            <ENSName name={name[1]} address={address} />
          ) : (
            <Address address={address} />
          )}
        </>
      ) : (
        <>
          {name?.[0] ? (
            <ENSNameLink
              name={name[1]}
              address={address}
              dontOverrideColors={dontOverrideColors}
            />
          ) : (
            <AddressLink
              address={address}
              text={text}
              dontOverrideColors={dontOverrideColors}
            />
          )}
        </>
      )}
    </>
  );
};

export default AddressOrENSName;
