import React from "react";
import { NavLink } from "react-router-dom";
import TokenLogo from "./TokenLogo";
import { ResolvedAddressRenderer } from "../api/address-resolver/address-resolver";
import {
  UniswapV3PairMeta,
  UniswapV3TokenMeta,
} from "../api/address-resolver/UniswapV3Resolver";
import { ChecksummedAddress } from "../types";

type UniswapV3PoolNameProps = {
  chainId: number;
  address: string;
  token0: UniswapV3TokenMeta;
  token1: UniswapV3TokenMeta;
  fee: number;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const UniswapV3PairName: React.FC<UniswapV3PoolNameProps> = ({
  chainId,
  address,
  token0,
  token1,
  fee,
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
        title={`Uniswap V3 LP (${token0.symbol}/${token1.symbol}/${
          fee / 10000
        }%): ${address}`}
      >
        <span>Uniswap V3 LP:</span>
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
        <span>/ {fee / 10000}%</span>
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 font-sans text-gray-700 truncate"
      title={`Uniswap V3 LP (${token0.symbol}/${token1.symbol}/${
        fee / 10000
      }%): ${address}`}
    >
      <span>Uniswap V3 LP:</span>
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
      <span>/ {fee / 10000}%</span>
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
    <div
      className={`self-center w-5 h-5 ${linkable ? "" : "filter grayscale"}`}
    >
      <TokenLogo chainId={chainId} address={address} name={name} />
    </div>
    <span>{symbol}</span>
  </>
);

export const uniswapV3PairRenderer: ResolvedAddressRenderer<
  UniswapV3PairMeta
> = (chainId, address, tokenMeta, linkable, dontOverrideColors) => (
  <UniswapV3PairName
    chainId={chainId}
    address={address}
    token0={tokenMeta.token0}
    token1={tokenMeta.token1}
    fee={tokenMeta.fee}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default UniswapV3PairName;
