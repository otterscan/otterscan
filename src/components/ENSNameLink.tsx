import React from "react";
import { NavLink } from "react-router-dom";
import ENSLogo from "./ensLogo.svg";

type ENSNameLinkProps = {
  name: string;
  address: string;
  dontOverrideColors?: boolean;
};

const ENSNameLink: React.FC<ENSNameLinkProps> = ({
  name,
  address,
  dontOverrideColors,
}) => (
  <NavLink
    className={`flex items-baseline space-x-1 font-sans ${
      dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
    } truncate`}
    to={`/address/${name}`}
    title={`${name}: ${address}`}
  >
    <img
      className="self-center"
      src={ENSLogo}
      alt="ENS Logo"
      width={12}
      height={12}
    />
    <span className="truncate">{name}</span>
  </NavLink>
);

export default React.memo(ENSNameLink);
