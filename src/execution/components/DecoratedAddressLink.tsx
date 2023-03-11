import { FC, memo, useContext } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBomb,
  faBurn,
  faCoins,
  faMoneyBillAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import SourcifyLogo from "../../sourcify/SourcifyLogo";
import { AddressAwareComponentProps } from "../types";
import PlainAddress from "./PlainAddress";
import AddressLegend from "../../components/AddressLegend";
import AddressAttributes from "../address/AddressAttributes";
import { RuntimeContext } from "../../useRuntime";
import { useSourcifyMetadata } from "../../sourcify/useSourcify";
import { useResolvedAddress } from "../../useResolvedAddresses";
import { AddressContext, ChecksummedAddress, ZERO_ADDRESS } from "../../types";
import { resolverRendererRegistry } from "../../api/address-resolver";

export type DecoratedAddressLinkProps = AddressAwareComponentProps & {
  selectedAddress?: ChecksummedAddress | undefined;
  addressCtx?: AddressContext | undefined;
  creation?: boolean | undefined;
  miner?: boolean | undefined;
  selfDestruct?: boolean | undefined;
  txFrom?: boolean | undefined;
  txTo?: boolean | undefined;
  eoa?: boolean | undefined;

  // Ignore all address resolvers and display the plain address
  plain?: boolean | undefined;
};

const DecoratedAddressLink: FC<DecoratedAddressLinkProps> = ({
  address,
  selectedAddress,
  addressCtx,
  creation,
  miner,
  selfDestruct,
  txFrom,
  txTo,
  eoa,
  plain,
}) => {
  const { config, provider } = useContext(RuntimeContext);
  const match = useSourcifyMetadata(address, provider?.network.chainId);

  const mint = addressCtx === AddressContext.FROM && address === ZERO_ADDRESS;
  const burn = addressCtx === AddressContext.TO && address === ZERO_ADDRESS;

  return (
    <div
      className={`flex items-baseline space-x-1 ${
        txFrom ? "bg-skin-from" : ""
      } ${txTo ? "bg-skin-to" : ""} ${
        mint ? "italic text-emerald-500 hover:text-emerald-700" : ""
      } ${burn ? "text-orange-500 line-through hover:text-orange-700" : ""} ${
        selfDestruct ? "line-through opacity-70 hover:opacity-100" : ""
      }`}
    >
      {creation && (
        <span className="text-amber-300" title="Contract creation">
          <FontAwesomeIcon icon={faStar} size="1x" />
        </span>
      )}
      {selfDestruct && (
        <span className="text-red-800" title="Self destruct">
          <FontAwesomeIcon icon={faBomb} size="1x" />
        </span>
      )}
      {mint && (
        <span className="text-emerald-500" title="Mint address">
          <FontAwesomeIcon icon={faMoneyBillAlt} size="1x" />
        </span>
      )}
      {burn && (
        <span className="text-orange-500" title="Burn address">
          <FontAwesomeIcon icon={faBurn} size="1x" />
        </span>
      )}
      {miner && (
        <span className="text-amber-400" title="Miner address">
          <FontAwesomeIcon icon={faCoins} size="1x" />
        </span>
      )}
      {match && (
        <NavLink
          className="flex shrink-0 items-center self-center"
          to={`/address/${address}/contract`}
        >
          <SourcifyLogo />
        </NavLink>
      )}
      {plain ? (
        <PlainAddress
          address={address}
          linkable={address !== selectedAddress}
          dontOverrideColors={mint || burn}
        />
      ) : (
        <ResolvedAddress
          address={address}
          selectedAddress={selectedAddress}
          dontOverrideColors={mint || burn}
        />
      )}
      {!mint && !burn && (
        <>
          {eoa === true && (
            <AddressLegend title="Externally owned account" uniqueId="eoa">
              [EOA]
            </AddressLegend>
          )}
          {eoa === false && (
            <AddressLegend title="Contract account" uniqueId="contract">
              [C]
            </AddressLegend>
          )}
        </>
      )}
      {config?.experimental && <AddressAttributes address={address} />}
    </div>
  );
};

type ResolvedAddressProps = AddressAwareComponentProps & {
  selectedAddress?: ChecksummedAddress | undefined;
  dontOverrideColors?: boolean;
};

const ResolvedAddress: FC<ResolvedAddressProps> = ({
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

export default memo(DecoratedAddressLink);
