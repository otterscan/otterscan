import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import TransactionAddress from "./TransactionAddress";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { InternalOperation } from "../types";

type InternalCreateProps = {
  internalOp: InternalOperation;
};

const InternalCreate: React.FC<InternalCreateProps> = ({ internalOp }) => (
  <div className="flex items-baseline space-x-1 whitespace-nowrap">
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
      <TransactionAddress address={internalOp.from} showCodeIndicator />)
    </span>
  </div>
);

export default InternalCreate;
