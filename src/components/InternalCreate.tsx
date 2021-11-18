import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import TransactionAddress from "./TransactionAddress";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { InternalOperation } from "../types";
import { ResolvedAddresses } from "../api/address-resolver";

type InternalCreateProps = {
  internalOp: InternalOperation;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const InternalCreate: React.FC<InternalCreateProps> = ({
  internalOp,
  resolvedAddresses,
}) => (
  <div className="flex items-baseline space-x-1 whitespace-nowrap">
    <span className="text-gray-500">
      <FontAwesomeIcon icon={faAngleRight} size="1x" /> CREATE
    </span>
    <span>Contract</span>
    <div className="flex items-baseline">
      <AddressHighlighter address={internalOp.to}>
        <DecoratedAddressLink
          address={internalOp.to}
          creation
          resolvedAddresses={resolvedAddresses}
        />
      </AddressHighlighter>
    </div>
    <span className="flex items-baseline text-gray-400">
      (Creator:{" "}
      <TransactionAddress
        address={internalOp.from}
        resolvedAddresses={resolvedAddresses}
      />
      )
    </span>
  </div>
);

export default InternalCreate;
