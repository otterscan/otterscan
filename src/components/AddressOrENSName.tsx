import React from "react";
import Address from "./Address";
import AddressLink from "./AddressLink";
import ENSName from "./ENSName";
import ENSNameLink from "./ENSNameLink";

type AddressOrENSNameProps = {
  address: string;
  ensName?: string;
  selectedAddress?: string;
};

const AddressOrENSName: React.FC<AddressOrENSNameProps> = ({
  address,
  ensName,
  selectedAddress,
}) => {
  return address === selectedAddress ? (
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
        <ENSNameLink name={ensName} address={address} />
      ) : (
        <AddressLink address={address} />
      )}
    </>
  );
};

export default React.memo(AddressOrENSName);
