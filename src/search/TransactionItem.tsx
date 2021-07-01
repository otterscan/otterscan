import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import MethodName from "../components/MethodName";
import BlockLink from "../components/BlockLink";
import TransactionLink from "../components/TransactionLink";
import Address from "../components/Address";
import AddressLink from "../components/AddressLink";
import TimestampAge from "../components/TimestampAge";
import TransactionDirection, {
  Direction,
} from "../components/TransactionDirection";
import TransactionValue from "../components/TransactionValue";
import { ProcessedTransaction } from "../types";
import { FeeDisplay } from "./useFeeToggler";
import { formatValue } from "../components/formatter";

type TransactionItemProps = {
  tx: ProcessedTransaction;
  selectedAddress?: string;
  feeDisplay: FeeDisplay;
};

const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  selectedAddress,
  feeDisplay,
}) => {
  let direction: Direction | undefined;
  if (selectedAddress) {
    if (tx.from === selectedAddress && tx.to === selectedAddress) {
      direction = Direction.SELF;
    } else if (tx.from === selectedAddress) {
      direction = Direction.OUT;
    } else if (tx.to === selectedAddress) {
      direction = Direction.IN;
    } else {
      direction = Direction.INTERNAL;
    }
  }

  return (
    <div className="grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 hover:bg-gray-100 px-2 py-3">
      <div className="col-span-2 flex space-x-1 items-baseline">
        {tx.status === 0 && (
          <span className="text-red-600" title="Transaction reverted">
            <FontAwesomeIcon icon={faExclamationCircle} />
          </span>
        )}
        <span className="truncate">
          <TransactionLink txHash={tx.hash} />
        </span>
      </div>
      <MethodName data={tx.data} />
      <span>
        <BlockLink blockTag={tx.blockNumber} />
      </span>
      <TimestampAge timestamp={tx.timestamp} />
      <span className="col-span-2 flex justify-between items-baseline space-x-2 pr-2">
        <span className="truncate" title={tx.from}>
          {tx.from &&
            (tx.from === selectedAddress ? (
              <Address>{tx.from}</Address>
            ) : (
              <AddressLink address={tx.from} />
            ))}
        </span>
        <span>
          <TransactionDirection direction={direction} />
        </span>
      </span>
      <span className="col-span-2 truncate" title={tx.to}>
        {tx.to &&
          (tx.to === selectedAddress ? (
            <Address>{tx.to}</Address>
          ) : (
            <AddressLink address={tx.to} />
          ))}
      </span>
      <span className="col-span-2 truncate">
        <TransactionValue value={tx.value} />
      </span>
      <span className="font-balance text-xs text-gray-500 truncate">
        {feeDisplay === FeeDisplay.TX_FEE
          ? formatValue(tx.fee, 18)
          : formatValue(tx.gasPrice, 9)}
      </span>
    </div>
  );
};

export default React.memo(TransactionItem);
