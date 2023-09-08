import { FC } from "react";
import { NavLink } from "react-router-dom";
import TokenLogo from "./TokenLogo";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";
import { ChecksummedAddress } from "../../../types";
import {
  UniswapV1PairMeta,
  UniswapV1TokenMeta,
} from "../../../api/address-resolver/UniswapV1Resolver";

type UniswapV1ExchangeNameProps = {
  chainId: bigint;
  address: string;
  token: UniswapV1TokenMeta;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const UniswapV1ExchangeName: FC<UniswapV1ExchangeNameProps> = ({
  chainId,
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
          chainId={chainId}
          address={token.address}
          name={token.name}
          symbol={token.symbol}
          linkable
        />
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 truncate font-sans text-gray-700"
      title={`Uniswap V1 LP (${token.symbol}): ${address}`}
    >
      <span>Uniswap V1 LP:</span>
      <Content
        chainId={chainId}
        address={token.address}
        name={token.name}
        symbol={token.symbol}
      />
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

export const uniswapV1PairRenderer: ResolvedAddressRenderer<
  UniswapV1PairMeta
> = (chainId, address, tokenMeta, linkable, dontOverrideColors) => (
  <UniswapV1ExchangeName
    chainId={chainId}
    address={address}
    token={tokenMeta.token}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default UniswapV1ExchangeName;
