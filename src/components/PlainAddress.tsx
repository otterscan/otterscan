import React from "react";
import { NavLink } from "react-router-dom";

type PlainAddressProps = {
  address: string;
  linkable: boolean;
  dontOverrideColors: boolean | undefined;
};

const PlainAddress: React.FC<PlainAddressProps> = ({
  address,
  linkable,
  dontOverrideColors,
}) => {
  if (linkable) {
    return (
      <NavLink
        className={`${
          dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
        } truncate font-address`}
        to={`/address/${address}`}
        title={address}
      >
        {address}
      </NavLink>
    );
  }

  return (
    <span className="truncate font-address text-gray-400" title={address}>
      {address}
    </span>
  );
};

export default PlainAddress;
