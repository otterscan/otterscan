import React from "react";
import { NavLink } from "react-router-dom";
import TokenLogo from "./TokenLogo";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";
import {
  UniswapV2PairMeta,
  UniswapV2TokenMeta,
} from "../../../api/address-resolver/UniswapV2Resolver";
import { ChecksummedAddress } from "../../../types";

type UniswapV2PairNameProps = {
  chainId: number;
  address: string;
  token0: UniswapV2TokenMeta;
  token1: UniswapV2TokenMeta;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const UniswapV2PairName: React.FC<UniswapV2PairNameProps> = ({
  chainId,
  address,
  token0,
  token1,
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
        title={`Uniswap V2 LP (${token0.symbol}/${token1.symbol}): ${address}`}
      >
        <span>Uniswap V2 LP:</span>
        <Content
          chainId={chainId}
          address={token0.address}
          name={token0.name}
          symbol={token0.symbol}
          linkable
        />
        <span>/</span>
        <Content
          chainId={chainId}
          address={token1.address}
          name={token1.name}
          symbol={token1.symbol}
          linkable
        />
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 truncate font-sans text-gray-700"
      title={`Uniswap V2 LP (${token0.symbol}/${token1.symbol}): ${address}`}
    >
      <span>Uniswap V2 LP:</span>
      <Content
        chainId={chainId}
        address={token0.address}
        name={token0.name}
        symbol={token0.symbol}
      />
      <span>/</span>
      <Content
        chainId={chainId}
        address={token1.address}
        name={token1.name}
        symbol={token1.symbol}
      />
    </div>
  );
};

type ContentProps = {
  chainId: number;
  address: ChecksummedAddress;
  name: string;
  symbol: string;
  linkable?: boolean;
};

const Content: React.FC<ContentProps> = ({
  chainId,
  address,
  name,
  symbol,
  linkable,
}) => (
  <>
    <div className={`h-5 w-5 self-center ${linkable ? "" : "grayscale"}`}>
      <TokenLogo chainId={chainId} address={address} name={name} />
    </div>
    <span>{symbol}</span>
  </>
);

export const uniswapV2PairRenderer: ResolvedAddressRenderer<
  UniswapV2PairMeta
> = (chainId, address, tokenMeta, linkable, dontOverrideColors) => (
  <UniswapV2PairName
    chainId={chainId}
    address={address}
    token0={tokenMeta.token0}
    token1={tokenMeta.token1}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default UniswapV2PairName;
