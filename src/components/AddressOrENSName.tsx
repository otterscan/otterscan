import React from "react";
import Address from "./Address";
import AddressLink from "./AddressLink";
import ENSName from "./ENSName";
import ENSNameLink from "./ENSNameLink";

type AddressOrENSNameProps = {
  address: string;
  ensName?: string;
  selectedAddress?: string;
  text?: string;
  dontOverrideColors?: boolean;
};

const AddressOrENSName: React.FC<AddressOrENSNameProps> = ({
  address,
  ensName,
  selectedAddress,
  text,
  dontOverrideColors,
}) => (
  <>
    {address === selectedAddress ? (
      <>
        {ensName ? (
          <ENSName name={ensName} address={address} />
        ) : (
          <Address address={address} />
        )}
      </>
    ) : (
      <>
        {ensName ? (
          <ENSNameLink
            name={ensName}
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

export default AddressOrENSName;
