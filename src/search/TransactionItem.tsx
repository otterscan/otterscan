import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import MethodName from "../components/MethodName";
import BlockLink from "../components/BlockLink";
import TransactionLink from "../components/TransactionLink";
import AddressOrENSName from "../components/AddressOrENSName";
import TimestampAge from "../components/TimestampAge";
import TransactionDirection, {
  Direction,
  Flags,
} from "../components/TransactionDirection";
import TransactionValue from "../components/TransactionValue";
import { ENSReverseCache, ProcessedTransaction } from "../types";
import { FeeDisplay } from "./useFeeToggler";
import { formatValue } from "../components/formatter";
import { useSelectionContext } from "../useSelection";

type TransactionItemProps = {
  tx: ProcessedTransaction;
  ensCache?: ENSReverseCache;
  selectedAddress?: string;
  feeDisplay: FeeDisplay;
};

const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  ensCache,
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

  const ensFrom = ensCache && tx.from && ensCache[tx.from];
  const ensTo = ensCache && tx.to && ensCache[tx.to];
  const flash = tx.gasPrice.isZero() && tx.internalMinerInteraction;

  const [selection, setSelection] = useSelectionContext();
  const select = (address: string) => {
    setSelection({ type: "address", content: address });
  };
  const deselect = () => {
    setSelection(null);
  };

  return (
    <div
      className={`grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 ${
        flash ? "bg-yellow-100 hover:bg-yellow-200" : "hover:bg-gray-100"
      } px-2 py-3`}
    >
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
          {tx.from && (
            <div
              className={`border border-dashed rounded hover:bg-transparent hover:border-transparent px-1 ${
                selection !== null &&
                selection.type === "address" &&
                selection.content === tx.from
                  ? "border-orange-400 bg-yellow-100"
                  : "border-transparent"
              }`}
              onMouseEnter={() => select(tx.from!)}
              onMouseLeave={deselect}
            >
              <AddressOrENSName
                address={tx.from}
                ensName={ensFrom}
                selectedAddress={selectedAddress}
                minerAddress={tx.miner}
              />
            </div>
          )}
        </span>
        <span>
          <TransactionDirection
            direction={direction}
            flags={tx.internalMinerInteraction ? Flags.MINER : undefined}
          />
        </span>
      </span>
      <span className="col-span-2 truncate" title={tx.to}>
        {tx.to && (
          <div
            className={`border border-dashed rounded hover:bg-transparent hover:border-transparent px-1 ${
              selection !== null &&
              selection.type === "address" &&
              selection.content === tx.to
                ? "border-orange-400 bg-yellow-100"
                : "border-transparent"
            }`}
            onMouseEnter={() => select(tx.to!)}
            onMouseLeave={deselect}
          >
            <AddressOrENSName
              address={tx.to}
              ensName={ensTo}
              selectedAddress={selectedAddress}
              minerAddress={tx.miner}
            />
          </div>
        )}
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
