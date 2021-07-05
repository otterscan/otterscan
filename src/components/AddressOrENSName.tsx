import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import Address from "./Address";
import AddressLink from "./AddressLink";
import ENSName from "./ENSName";
import ENSNameLink from "./ENSNameLink";

type AddressOrENSNameProps = {
  address: string;
  ensName?: string;
  selectedAddress?: string;
  minerAddress?: string;
};

const AddressOrENSName: React.FC<AddressOrENSNameProps> = ({
  address,
  ensName,
  selectedAddress,
  minerAddress,
}) => (
  <div className="flex items-baseline space-x-1">
    {minerAddress !== undefined && minerAddress === address && (
      <span className="text-yellow-400" title="Miner address">
        <FontAwesomeIcon icon={faCoins} size="1x" />
      </span>
    )}
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
          <ENSNameLink name={ensName} address={address} />
        ) : (
          <AddressLink address={address} />
        )}
      </>
    )}
  </div>
);

export default React.memo(AddressOrENSName);
