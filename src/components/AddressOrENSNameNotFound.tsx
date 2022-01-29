import React from "react";

type AddressOrENSNameNotFoundProps = {
  addressOrENSName: string;
};

const AddressOrENSNameNotFound: React.FC<AddressOrENSNameNotFoundProps> = ({
  addressOrENSName,
}) => (
  <span className="text-base">
    "{addressOrENSName}" is not an ETH address or ENS name.
  </span>
);

export default React.memo(AddressOrENSNameNotFound);
