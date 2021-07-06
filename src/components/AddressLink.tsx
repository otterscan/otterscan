import React from "react";
import { NavLink } from "react-router-dom";

type AddressLinkProps = {
  address: string;
  text?: string;
};

const AddressLink: React.FC<AddressLinkProps> = ({ address, text }) => (
  <NavLink
    className="text-link-blue hover:text-link-blue-hover font-address truncate"
    to={`/address/${address}`}
  >
    <p className="truncate" title={text ?? address}>
      {text ?? address}
    </p>
  </NavLink>
);

export default React.memo(AddressLink);
