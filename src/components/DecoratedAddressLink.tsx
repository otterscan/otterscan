import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillAlt,
  faBurn,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import AddressOrENSName from "./AddressOrENSName";
import { AddressContext, ZERO_ADDRESS } from "../types";

type DecoratedAddressLinkProps = {
  address: string;
  ensName?: string;
  selectedAddress?: string;
  text?: string;
  addressCtx?: AddressContext;
  miner?: boolean;
};

const DecoratedAddresssLink: React.FC<DecoratedAddressLinkProps> = ({
  address,
  ensName,
  selectedAddress,
  text,
  addressCtx,
  miner,
}) => {
  const mint = addressCtx === AddressContext.FROM && address === ZERO_ADDRESS;
  const burn = addressCtx === AddressContext.TO && address === ZERO_ADDRESS;

  return (
    <div
      className={`flex items-baseline space-x-1 ${mint ? "italic" : ""} ${
        burn ? "line-through" : ""
      }`}
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
      <AddressOrENSName
        address={address}
        ensName={ensName}
        selectedAddress={selectedAddress}
        text={text}
      />
    </div>
  );
};

export default React.memo(DecoratedAddresssLink);
