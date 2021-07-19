import React from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { TransactionData, Transfer } from "../types";

type InternalTransferProps = {
  txData: TransactionData;
  transfer: Transfer;
};

const InternalTransfer: React.FC<InternalTransferProps> = ({
  txData,
  transfer,
}) => {
  const fromMiner =
    txData.miner !== undefined && transfer.from === txData.miner;
  const toMiner = txData.miner !== undefined && transfer.to === txData.miner;

  return (
    <div className="flex items-baseline space-x-1 text-xs">
      <span className="text-gray-500">
        <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
      </span>
      <span>{ethers.utils.formatEther(transfer.value)} Ether</span>
      <div className="flex items-baseline">
        <span className="text-gray-500">From</span>
        <AddressHighlighter address={transfer.from}>
          <div
            className={`flex items-baseline space-x-1 ${
              fromMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
            }`}
          >
            <DecoratedAddressLink
              address={transfer.from}
              miner={fromMiner}
              txFrom={transfer.from === txData.from}
              txTo={transfer.from === txData.to}
            />
          </div>
        </AddressHighlighter>
      </div>
      <div className="flex items-baseline">
        <span className="text-gray-500">To</span>
        <AddressHighlighter address={transfer.to}>
          <div
            className={`flex items-baseline space-x-1 ${
              toMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
            }`}
          >
            <DecoratedAddressLink
              address={transfer.to}
              miner={toMiner}
              txFrom={transfer.to === txData.from}
              txTo={transfer.to === txData.to}
            />
          </div>
        </AddressHighlighter>
      </div>
    </div>
  );
};

export default React.memo(InternalTransfer);
