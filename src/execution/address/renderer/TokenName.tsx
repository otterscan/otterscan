import { FC } from "react";
import { NavLink } from "react-router-dom";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";
import { TokenMeta } from "../../../types";
import TokenLogo from "./TokenLogo";

type TokenNameProps = {
  chainId: bigint;
  address: string;
  name: string;
  symbol: string;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const TokenName: FC<TokenNameProps> = ({
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
      className="flex items-baseline space-x-1 truncate font-sans text-gray-700"
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
  chainId: bigint;
  address: string;
  name: string;
  symbol: string;
  linkable: boolean;
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
  dontOverrideColors,
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
