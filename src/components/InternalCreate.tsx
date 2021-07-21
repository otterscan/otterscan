import React, { useContext } from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faBomb } from "@fortawesome/free-solid-svg-icons";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { TransactionData, Transfer } from "../types";

type InternalCreateProps = {
  txData: TransactionData;
  transfer: Transfer;
};

const InternalCreate: React.FC<InternalCreateProps> = ({
  txData,
  transfer,
}) => {
  return (
    <>
      <div className="flex items-baseline space-x-1 text-xs">
        <span className="text-gray-500">
          <FontAwesomeIcon icon={faAngleRight} size="1x" /> CREATE
        </span>
        <span>Contract</span>
        <div className="flex items-baseline">
          <AddressHighlighter address={transfer.to}>
            <DecoratedAddressLink address={transfer.to} creation />
          </AddressHighlighter>
        </div>
        <span className="flex items-baseline text-gray-400">
          (Creator:{" "}
          <AddressHighlighter address={transfer.from}>
            <DecoratedAddressLink
              address={transfer.from}
              txFrom={transfer.from === txData.from}
              txTo={transfer.from === txData.to}
            />
          </AddressHighlighter>
          )
        </span>
      </div>
    </>
  );
};

export default React.memo(InternalCreate);
