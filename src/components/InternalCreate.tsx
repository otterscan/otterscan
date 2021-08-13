import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { TransactionData, InternalOperation } from "../types";

type InternalCreateProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
};

const InternalCreate: React.FC<InternalCreateProps> = ({
  txData,
  internalOp,
}) => {
  return (
    <>
      <div className="flex items-baseline space-x-1 text-xs">
        <span className="text-gray-500">
          <FontAwesomeIcon icon={faAngleRight} size="1x" /> CREATE
        </span>
        <span>Contract</span>
        <div className="flex items-baseline">
          <AddressHighlighter address={internalOp.to}>
            <DecoratedAddressLink address={internalOp.to} creation />
          </AddressHighlighter>
        </div>
        <span className="flex items-baseline text-gray-400">
          (Creator:{" "}
          <AddressHighlighter address={internalOp.from}>
            <DecoratedAddressLink
              address={internalOp.from}
              txFrom={internalOp.from === txData.from}
              txTo={internalOp.from === txData.to}
            />
          </AddressHighlighter>
          )
        </span>
      </div>
    </>
  );
};

export default React.memo(InternalCreate);
