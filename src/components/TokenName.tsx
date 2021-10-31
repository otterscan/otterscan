import React from "react";
import { NavLink } from "react-router-dom";
import TokenLogo from "./TokenLogo";
import { ResolvedAddressRenderer } from "../api/address-resolver/address-resolver";
import { TokenMeta } from "../types";

type TokenNameProps = {
  name: string;
  address: string;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const TokenName: React.FC<TokenNameProps> = ({
  name,
  address,
  linkable,
  dontOverrideColors,
}) => {
  if (linkable) {
    return (
      <NavLink
        className={`flex items-baseline space-x-1 font-sans ${
          dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
        } truncate`}
        to={`/address/${address}`}
        title={`${name}: ${address}`}
      >
        <Content address={address} linkable={true} name={name} />
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 font-sans text-gray-700 truncate"
      title={`${name}: ${address}`}
    >
      <Content address={address} linkable={false} name={name} />
    </div>
  );
};

type ContentProps = {
  address: string;
  linkable: boolean;
  name: string;
};

const Content: React.FC<ContentProps> = ({ address, linkable, name }) => (
  <>
    <div className="self-center w-5 h-5">
      <TokenLogo address={address} name={name} />
    </div>
    <span className="truncate">{name}</span>
  </>
);

export const tokenRenderer: ResolvedAddressRenderer<TokenMeta> = (
  address,
  resolvedAddress,
  linkable,
  dontOverrideColors
) => (
  <TokenName
    address={address}
    name={resolvedAddress.name}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default TokenName;
