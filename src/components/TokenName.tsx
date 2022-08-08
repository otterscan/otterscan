import React from "react";
import { NavLink } from "react-router-dom";
import TokenLogo from "./TokenLogo";
import { ResolvedAddressRenderer } from "../api/address-resolver/address-resolver";
import { TokenMeta } from "../types";

type TokenNameProps = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const TokenName: React.FC<TokenNameProps> = ({
  chainId,
  address,
  name,
  symbol,
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
        title={`${name} (${symbol}): ${address}`}
      >
        <Content
          chainId={chainId}
          address={address}
          linkable={true}
          name={name}
          symbol={symbol}
        />
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 font-sans text-gray-700 truncate"
      title={`${name} (${symbol}): ${address}`}
    >
      <Content
        chainId={chainId}
        address={address}
        linkable={false}
        name={name}
        symbol={symbol}
      />
    </div>
  );
};

type ContentProps = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  linkable: boolean;
};

const Content: React.FC<ContentProps> = ({
  chainId,
  address,
  name,
  symbol,
  linkable,
}) => (
  <>
    <div
      className={`self-center w-5 h-5 ${linkable ? "" : "grayscale"}`}
    >
      <TokenLogo chainId={chainId} address={address} name={name} />
    </div>
    <span className="truncate">
      {name} ({symbol})
    </span>
  </>
);

export const tokenRenderer: ResolvedAddressRenderer<TokenMeta> = (
  chainId,
  address,
  tokenMeta,
  linkable,
  dontOverrideColors
) => (
  <TokenName
    chainId={chainId}
    address={address}
    name={tokenMeta.name}
    symbol={tokenMeta.symbol}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default TokenName;
