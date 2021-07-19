import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillAlt,
  faBurn,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import TokenLogo from "./TokenLogo";
import AddressOrENSName from "./AddressOrENSName";
import { AddressContext, TokenMeta, ZERO_ADDRESS } from "../types";

type DecoratedAddressLinkProps = {
  address: string;
  ensName?: string;
  selectedAddress?: string;
  text?: string;
  addressCtx?: AddressContext;
  miner?: boolean;
  selfDestruct?: boolean;
  txFrom?: boolean;
  txTo?: boolean;
  tokenMeta?: TokenMeta;
};

const DecoratedAddresssLink: React.FC<DecoratedAddressLinkProps> = ({
  address,
  ensName,
  selectedAddress,
  text,
  addressCtx,
  miner,
  selfDestruct,
  txFrom,
  txTo,
  tokenMeta,
}) => {
  const mint = addressCtx === AddressContext.FROM && address === ZERO_ADDRESS;
  const burn = addressCtx === AddressContext.TO && address === ZERO_ADDRESS;

  return (
    <div
      className={`flex items-baseline space-x-1 ${txFrom ? "bg-red-50" : ""} ${
        txTo ? "bg-green-50" : ""
      } ${mint ? "italic text-green-500 hover:text-green-700" : ""} ${
        burn ? "line-through text-orange-500 hover:text-orange-700" : ""
      } ${selfDestruct ? "line-through opacity-70 hover:opacity-100" : ""}`}
    >
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
      {tokenMeta && (
        <div className="self-center">
          <TokenLogo address={address} name={tokenMeta.name} />
        </div>
      )}
      <AddressOrENSName
        address={address}
        ensName={ensName}
        selectedAddress={selectedAddress}
        text={text}
        dontOverrideColors={mint || burn}
      />
    </div>
  );
};

export default React.memo(DecoratedAddresssLink);
