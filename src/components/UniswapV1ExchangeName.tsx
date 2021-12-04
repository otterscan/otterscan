import React from "react";
import { NavLink } from "react-router-dom";
import TokenLogo from "./TokenLogo";
import { ResolvedAddressRenderer } from "../api/address-resolver/address-resolver";
import { ChecksummedAddress } from "../types";
import {
  UniswapV1PairMeta,
  UniswapV1TokenMeta,
} from "../api/address-resolver/UniswapV1Resolver";

type UniswapV1ExchangeNameProps = {
  address: string;
  token: UniswapV1TokenMeta;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const UniswapV1ExchangeName: React.FC<UniswapV1ExchangeNameProps> = ({
  address,
  token,
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
        title={`Uniswap V1 LP (${token.symbol}): ${address}`}
      >
        <span>Uniswap V1 LP:</span>
        <Content
          linkable={true}
          address={token.address}
          name={token.name}
          symbol={token.symbol}
        />
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 font-sans text-gray-700 truncate"
      title={`Uniswap V1 LP (${token.symbol}): ${address}`}
    >
      <span>Uniswap V1 LP:</span>
      <Content
        linkable={false}
        address={token.address}
        name={token.name}
        symbol={token.symbol}
      />
    </div>
  );
};

type ContentProps = {
  linkable: boolean;
  address: ChecksummedAddress;
  name: string;
  symbol: string;
};

const Content: React.FC<ContentProps> = ({
  address,
  name,
  symbol,
  linkable,
}) => (
  <>
    <div
      className={`self-center w-5 h-5 ${linkable ? "" : "filter grayscale"}`}
    >
      <TokenLogo address={address} name={name} />
    </div>
    <span>{symbol}</span>
  </>
);

export const uniswapV1PairRenderer: ResolvedAddressRenderer<UniswapV1PairMeta> =
  (address, tokenMeta, linkable, dontOverrideColors) => (
    <UniswapV1ExchangeName
      address={address}
      token={tokenMeta.token}
      linkable={linkable}
      dontOverrideColors={dontOverrideColors}
    />
  );

export default UniswapV1ExchangeName;
