import { FC } from "react";
import { NavLink } from "react-router-dom";
import {
  UniswapV3PairMeta,
  UniswapV3TokenMeta,
} from "../../../api/address-resolver/UniswapV3Resolver";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";
import { ChecksummedAddress } from "../../../types";
import TokenLogo from "./TokenLogo";

type UniswapV3PoolNameProps = {
  chainId: bigint;
  address: string;
  token0: UniswapV3TokenMeta;
  token1: UniswapV3TokenMeta;
  fee: bigint;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const UniswapV3PairName: FC<UniswapV3PoolNameProps> = ({
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
          Number(fee) / 10000
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
        <span>/ {Number(fee) / 10000}%</span>
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 truncate font-sans text-gray-700"
      title={`Uniswap V3 LP (${token0.symbol}/${token1.symbol}/${
        Number(fee) / 10000
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
      <span>/ {Number(fee) / 10000}%</span>
    </div>
  );
};

type ContentProps = {
  chainId: bigint;
  address: ChecksummedAddress;
  name: string;
  symbol: string;
  linkable?: boolean;
};

const Content: FC<ContentProps> = ({
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
