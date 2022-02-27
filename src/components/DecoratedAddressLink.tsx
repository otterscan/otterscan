import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons/faStar";
import { faBomb } from "@fortawesome/free-solid-svg-icons/faBomb";
import { faMoneyBillAlt } from "@fortawesome/free-solid-svg-icons/faMoneyBillAlt";
import { faBurn } from "@fortawesome/free-solid-svg-icons/faBurn";
import { faCoins } from "@fortawesome/free-solid-svg-icons/faCoins";
import SourcifyLogo from "../sourcify/SourcifyLogo";
import PlainAddress from "./PlainAddress";
import { Metadata } from "../sourcify/useSourcify";
import { RuntimeContext } from "../useRuntime";
import { useResolvedAddress } from "../useResolvedAddresses";
import { AddressContext, ChecksummedAddress, ZERO_ADDRESS } from "../types";
import { resolverRendererRegistry } from "../api/address-resolver";

type DecoratedAddressLinkProps = {
  address: ChecksummedAddress;
  selectedAddress?: ChecksummedAddress | undefined;
  addressCtx?: AddressContext | undefined;
  creation?: boolean | undefined;
  miner?: boolean | undefined;
  selfDestruct?: boolean | undefined;
  txFrom?: boolean | undefined;
  txTo?: boolean | undefined;
  metadata?: Metadata | null | undefined;
  eoa?: boolean | undefined;
};

const DecoratedAddressLink: React.FC<DecoratedAddressLinkProps> = ({
  address,
  selectedAddress,
  addressCtx,
  creation,
  miner,
  selfDestruct,
  txFrom,
  txTo,
  metadata,
  eoa,
}) => {
  const mint = addressCtx === AddressContext.FROM && address === ZERO_ADDRESS;
  const burn = addressCtx === AddressContext.TO && address === ZERO_ADDRESS;

  return (
    <div
      className={`flex items-baseline space-x-1 ${
        txFrom ? "bg-skin-from" : ""
      } ${txTo ? "bg-skin-to" : ""} ${
        mint ? "italic text-green-500 hover:text-green-700" : ""
      } ${burn ? "line-through text-orange-500 hover:text-orange-700" : ""} ${
        selfDestruct ? "line-through opacity-70 hover:opacity-100" : ""
      }`}
    >
      {creation && (
        <span className="text-yellow-300" title="Contract creation">
          <FontAwesomeIcon icon={faStar} size="1x" />
        </span>
      )}
      {selfDestruct && (
        <span className="text-red-800" title="Self destruct">
          <FontAwesomeIcon icon={faBomb} size="1x" />
        </span>
      )}
      {mint && (
        <span className="text-green-500" title="Mint address">
          <FontAwesomeIcon icon={faMoneyBillAlt} size="1x" />
        </span>
      )}
      {burn && (
        <span className="text-orange-500" title="Burn address">
          <FontAwesomeIcon icon={faBurn} size="1x" />
        </span>
      )}
      {miner && (
        <span className="text-yellow-400" title="Miner address">
          <FontAwesomeIcon icon={faCoins} size="1x" />
        </span>
      )}
      {metadata && (
        <NavLink
          className="self-center flex-shrink-0 flex items-center"
          to={`/address/${address}/contract`}
        >
          <SourcifyLogo />
        </NavLink>
      )}
      <ResolvedAddress
        address={address}
        selectedAddress={selectedAddress}
        dontOverrideColors={mint || burn}
      />
      {eoa === true && (
        <span
          className="text-xs text-gray-400 text-opacity-70"
          title="Externally owned account"
        >
          (EOA)
        </span>
      )}
      {eoa === false && (
        <span
          className="text-xs text-gray-400 text-opacity-70"
          title="Contract account"
        >
          (C)
        </span>
      )}
    </div>
  );
};

type ResolvedAddressProps = {
  address: ChecksummedAddress;
  selectedAddress?: ChecksummedAddress | undefined;
  dontOverrideColors?: boolean;
};

const ResolvedAddress: React.FC<ResolvedAddressProps> = ({
  address,
  selectedAddress,
  dontOverrideColors,
}) => {
  const { provider } = useContext(RuntimeContext);
  const resolvedAddress = useResolvedAddress(provider, address);
  const linkable = address !== selectedAddress;

  if (!provider || !resolvedAddress) {
    return (
      <PlainAddress
        address={address}
        linkable={linkable}
        dontOverrideColors={dontOverrideColors}
      />
    );
  }

  const [resolver, resolvedName] = resolvedAddress;
  const renderer = resolverRendererRegistry.get(resolver);
  if (renderer === undefined) {
    return (
      <PlainAddress
        address={address}
        linkable={linkable}
        dontOverrideColors={dontOverrideColors}
      />
    );
  }

  return renderer(
    provider.network.chainId,
    address,
    resolvedName,
    linkable,
    !!dontOverrideColors
  );
};

export default React.memo(DecoratedAddressLink);
