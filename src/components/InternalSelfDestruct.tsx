import React from "react";
import { formatEther } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import TransactionAddress from "./TransactionAddress";
import { useChainInfo } from "../useChainInfo";
import { TransactionData, InternalOperation } from "../types";

type InternalSelfDestructProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
};

const InternalSelfDestruct: React.FC<InternalSelfDestructProps> = ({
  txData,
  internalOp,
}) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const toMiner =
    txData.confirmedData?.miner !== undefined &&
    internalOp.to === txData.confirmedData.miner;

  return (
    <>
      <div className="flex items-baseline space-x-1 whitespace-nowrap">
        <span className="text-gray-500">
          <FontAwesomeIcon icon={faAngleRight} size="1x" /> SELF DESTRUCT
        </span>
        <div className="flex items-baseline">
          <AddressHighlighter address={internalOp.from}>
            <DecoratedAddressLink address={internalOp.from} selfDestruct />
          </AddressHighlighter>
        </div>
        {internalOp.value.isZero() && (
          <div className="flex items-baseline text-gray-400">
            (To: <TransactionAddress address={internalOp.to} />)
          </div>
        )}
      </div>
      {!internalOp.value.isZero() && (
        <div className="ml-5 flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
          </span>
          <span>
            {formatEther(internalOp.value)} {symbol}
          </span>
          <div className="flex items-baseline">
            <span className="text-gray-500">To</span>
            <AddressHighlighter address={internalOp.to}>
              <div
                className={`flex items-baseline space-x-1 ${
                  toMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
                }`}
              >
                <DecoratedAddressLink address={internalOp.to} miner={toMiner} />
              </div>
            </AddressHighlighter>
          </div>
        </div>
      )}
    </>
  );
};

export default InternalSelfDestruct;
