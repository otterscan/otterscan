import React from "react";
import { NavLink } from "react-router-dom";

type PlainAddressProps = {
  address: string;
  text: string | undefined;
  linkable: boolean;
  dontOverrideColors: boolean | undefined;
};

const PlainAddress: React.FC<PlainAddressProps> = ({
  address,
  text,
  linkable,
  dontOverrideColors,
}) => {
  if (linkable) {
    return (
      <NavLink
        className={`${
          dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
        } font-address truncate`}
        to={`/address/${address}`}
        title={text ?? address}
      >
        <>{text ?? address}</>
      </NavLink>
    );
  }

  return (
    <span className="font-address text-gray-400 truncate" title={address}>
      {address}
    </span>
  );
};

export default PlainAddress;
