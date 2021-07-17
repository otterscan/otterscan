import React from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faBomb,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import AddressHighlighter from "./AddressHighlighter";
import AddressLink from "./AddressLink";
import { TransactionData, Transfer } from "../types";

type InternalSelfDestructProps = {
  txData: TransactionData;
  transfer: Transfer;
};

const InternalSelfDestruct: React.FC<InternalSelfDestructProps> = ({
  txData,
  transfer,
}) => {
  const fromMiner =
    txData.miner !== undefined && transfer.from === txData.miner;
  const toMiner = txData.miner !== undefined && transfer.to === txData.miner;

  return (
    <>
      <div className="flex items-baseline space-x-1 text-xs">
        <span className="text-gray-500">
          <span className="text-red-900">
            <FontAwesomeIcon icon={faBomb} size="1x" />
          </span>{" "}
          SELF DESTRUCT
        </span>
        <span>Contract</span>
        <div className="flex items-baseline">
          <AddressHighlighter address={transfer.from}>
            <div
              className={`flex items-baseline space-x-1 ${
                fromMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
              }`}
            >
              {fromMiner && (
                <span className="text-yellow-400" title="Miner address">
                  <FontAwesomeIcon icon={faCoins} size="1x" />
                </span>
              )}
              <AddressLink address={transfer.from} />
            </div>
          </AddressHighlighter>
        </div>
      </div>
      {!transfer.value.isZero() && (
        <div className="ml-5 flex items-baseline space-x-1 text-xs">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
          </span>
          <span>{ethers.utils.formatEther(transfer.value)} Ether</span>
          <div className="flex items-baseline">
            <span className="text-gray-500">To</span>
            <AddressHighlighter address={transfer.to}>
              <div
                className={`flex items-baseline space-x-1 ${
                  toMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
                }`}
              >
                {toMiner && (
                  <span className="text-yellow-400" title="Miner address">
                    <FontAwesomeIcon icon={faCoins} size="1x" />
                  </span>
                )}
                <AddressLink address={transfer.to} />
              </div>
            </AddressHighlighter>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(InternalSelfDestruct);
