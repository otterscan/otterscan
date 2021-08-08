import React from "react";
import { formatEther } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { TransactionData, InternalOperation } from "../types";

type InternalTransferProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
};

const InternalTransfer: React.FC<InternalTransferProps> = ({
  txData,
  internalOp,
}) => {
  const fromMiner =
    txData.miner !== undefined && internalOp.from === txData.miner;
  const toMiner = txData.miner !== undefined && internalOp.to === txData.miner;

  return (
    <div className="flex items-baseline space-x-1 text-xs">
      <span className="text-gray-500">
        <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
      </span>
      <span>{formatEther(internalOp.value)} Ether</span>
      <div className="flex items-baseline">
        <span className="text-gray-500">From</span>
        <AddressHighlighter address={internalOp.from}>
          <div
            className={`flex items-baseline space-x-1 ${
              fromMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
            }`}
          >
            <DecoratedAddressLink
              address={internalOp.from}
              miner={fromMiner}
              txFrom={internalOp.from === txData.from}
              txTo={internalOp.from === txData.to}
            />
          </div>
        </AddressHighlighter>
      </div>
      <div className="flex items-baseline">
        <span className="text-gray-500">To</span>
        <AddressHighlighter address={internalOp.to}>
          <div
            className={`flex items-baseline space-x-1 ${
              toMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
            }`}
          >
            <DecoratedAddressLink
              address={internalOp.to}
              miner={toMiner}
              txFrom={internalOp.to === txData.from}
              txTo={internalOp.to === txData.to}
            />
          </div>
        </AddressHighlighter>
      </div>
    </div>
  );
};

export default React.memo(InternalTransfer);
