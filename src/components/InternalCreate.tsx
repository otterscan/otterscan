import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import TransactionAddress from "../execution/components/TransactionAddress";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import { InternalOperation } from "../types";

type InternalCreateProps = {
  internalOp: InternalOperation;
};

const InternalCreate: React.FC<InternalCreateProps> = ({ internalOp }) => (
  <div className="flex items-baseline space-x-1 whitespace-nowrap">
    <span className="text-gray-500">
      <FontAwesomeIcon icon={faAngleRight} size="1x" /> CREATE
    </span>
    <span className="flex items-baseline text-gray-400">
      <TransactionAddress address={internalOp.from} showCodeIndicator />
    </span>
    <span className="text-gray-500">
      <FontAwesomeIcon icon={faCaretRight} size="1x" />
    </span>
    <div className="flex items-baseline">
      <AddressHighlighter address={internalOp.to}>
        <DecoratedAddressLink address={internalOp.to} creation />
      </AddressHighlighter>
    </div>
  </div>
);

export default InternalCreate;
