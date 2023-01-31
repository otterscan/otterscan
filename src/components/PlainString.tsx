import React from "react";
import { NavLink } from "react-router-dom";
import { ResolvedAddressRenderer } from "../api/address-resolver/address-resolver";

type PlainStringProps = {
  address: string;
  name: string;
  linkable: boolean;
  dontOverrideColors: boolean | undefined;
};

const PlainString: React.FC<PlainStringProps> = ({
  address,
  name,
  linkable,
  dontOverrideColors,
}) => {
  if (linkable) {
    return (
      <NavLink
        className={`${
          dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
        } truncate`}
        to={`/address/${address}`}
        title={name}
      >
        {name}
      </NavLink>
    );
  }

  return (
    <span className="truncate text-gray-400" title={name}>
      {name}
    </span>
  );
};

export const plainStringRenderer: ResolvedAddressRenderer<string> = (
  chainId,
  address,
  resolvedAddress,
  linkable,
  dontOverrideColors
) => (
  <PlainString
    address={address}
    name={resolvedAddress}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default PlainString;
