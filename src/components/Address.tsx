import React from "react";

type AddressProps = {
  address: string;
};

const Address: React.FC<AddressProps> = ({ address }) => (
  <span className="font-address text-gray-400 truncate" title={address}>
    <span className="truncate">{address}</span>
  </span>
);

export default React.memo(Address);
