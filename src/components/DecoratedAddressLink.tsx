import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons/faStar";
import { faBomb } from "@fortawesome/free-solid-svg-icons/faBomb";
import { faMoneyBillAlt } from "@fortawesome/free-solid-svg-icons/faMoneyBillAlt";
import { faBurn } from "@fortawesome/free-solid-svg-icons/faBurn";
import { faCoins } from "@fortawesome/free-solid-svg-icons/faCoins";
import TokenLogo from "./TokenLogo";
import AddressOrENSName from "./AddressOrENSName";
import { AddressContext, TokenMeta, ZERO_ADDRESS } from "../types";

type DecoratedAddressLinkProps = {
  address: string;
  ensName?: string;
  selectedAddress?: string;
  text?: string;
  addressCtx?: AddressContext;
  creation?: boolean;
  miner?: boolean;
  selfDestruct?: boolean;
  txFrom?: boolean;
  txTo?: boolean;
  tokenMeta?: TokenMeta;
};

const DecoratedAddressLink: React.FC<DecoratedAddressLinkProps> = ({
  address,
  ensName,
  selectedAddress,
  text,
  addressCtx,
  creation,
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

export default React.memo(DecoratedAddressLink);
