import React from "react";
import Address from "./Address";
import AddressLink from "./AddressLink";
import ENSName from "./ENSName";
import ENSNameLink from "./ENSNameLink";
import { ResolvedAddresses } from "../api/address-resolver";

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
          {name ? (
            <ENSName name={name} address={address} />
          ) : (
            <Address address={address} />
          )}
        </>
      ) : (
        <>
          {name ? (
            <ENSNameLink
              name={name}
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

export default React.memo(AddressOrENSName);
