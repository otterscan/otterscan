import React from "react";
import { formatEther } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { TransactionData, InternalOperation } from "../types";
import { ResolvedAddresses } from "../api/address-resolver";
import TransactionAddress from "./TransactionAddress";

const CHI_ADDRESS = "0x0000000000004946c0e9F43F4Dee607b0eF1fA1c";
const GST2_ADDRESS = "0x0000000000b3F879cb30FE243b4Dfee438691c04";

type InternalSelfDestructProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const InternalSelfDestruct: React.FC<InternalSelfDestructProps> = ({
  txData,
  internalOp,
  resolvedAddresses,
}) => {
  const toMiner =
    txData.confirmedData?.miner !== undefined &&
    internalOp.to === txData.confirmedData.miner;

  return (
    <>
      <div className="flex items-baseline space-x-1 whitespace-nowrap">
        <span className="text-gray-500">
          <FontAwesomeIcon icon={faAngleRight} size="1x" /> SELF DESTRUCT
        </span>
        <span>Contract</span>
        <div className="flex items-baseline">
          <AddressHighlighter address={internalOp.from}>
            <DecoratedAddressLink
              address={internalOp.from}
              selfDestruct
              resolvedAddresses={resolvedAddresses}
            />
          </AddressHighlighter>
        </div>
        {internalOp.value.isZero() && (
          <div className="flex items-baseline text-gray-400">
            (To:{" "}
            <TransactionAddress
              address={internalOp.to}
              resolvedAddresses={resolvedAddresses}
            />
            )
          </div>
        )}
      </div>
      {!internalOp.value.isZero() && (
        <div className="ml-5 flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
          </span>
          <span>{formatEther(internalOp.value)} Ether</span>
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
                  resolvedAddresses={resolvedAddresses}
                />
              </div>
            </AddressHighlighter>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(InternalSelfDestruct);
