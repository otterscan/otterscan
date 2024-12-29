import React from "react";
import { NavLink } from "react-router";

type AddressLinkProps = {
  address: string;
  text?: string;
  dontOverrideColors?: boolean;
};

const AddressLink: React.FC<AddressLinkProps> = ({
  address,
  text,
  dontOverrideColors,
}) => (
  <NavLink
    className={`${
      dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
    } truncate font-address`}
    to={`/address/${address}`}
  >
    <span className="truncate" title={text ?? address}>
      {text ?? address}
    </span>
  </NavLink>
);

export default AddressLink;
