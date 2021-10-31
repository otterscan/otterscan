import React from "react";

type AddressProps = {
  address: string;
};

const Address: React.FC<AddressProps> = ({ address }) => (
  <span className="font-address text-gray-400 truncate" title={address}>
    {address}
  </span>
);

export default Address;
