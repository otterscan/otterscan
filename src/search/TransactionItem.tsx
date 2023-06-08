import React, { useContext } from "react";
import MethodName from "../components/MethodName";
import BlockLink from "../components/BlockLink";
import TransactionLink from "../components/TransactionLink";
import TimestampAge from "../components/TimestampAge";
import TransactionDirection, {
  Direction,
  Flags,
} from "../components/TransactionDirection";
import NativeTokenAmount from "../components/NativeTokenAmount";
import TransactionItemFiatFee from "./TransactionItemFiatFee";
import { ProcessedTransaction } from "../types";
import { FeeDisplay } from "./useFeeToggler";
import { RuntimeContext } from "../useRuntime";
import { useSendsToMiner } from "../useErigonHooks";
import { formatValue } from "../components/formatter";
import TransactionAddress from "../execution/components/TransactionAddress";
import { BlockNumberContext } from "../useBlockTagContext";

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
  const { provider } = useContext(RuntimeContext);
  const [sendsToMiner] = useSendsToMiner(provider, tx.hash, tx.miner);

  let direction: Direction | undefined;
  if (selectedAddress) {
    if (tx.from === selectedAddress && tx.to === selectedAddress) {
      direction = Direction.SELF;
    } else if (tx.from === selectedAddress) {
      direction = Direction.OUT;
    } else if (
      tx.to === selectedAddress ||
      tx.createdContractAddress === selectedAddress
    ) {
      direction = Direction.IN;
    } else {
      direction = Direction.INTERNAL;
    }
  }

  const flash = tx.gasPrice.isZero() && sendsToMiner;

  return (
    <BlockNumberContext.Provider value={tx.blockNumber}>
      <div
        className={`grid grid-cols-12 items-baseline gap-x-1 border-t border-gray-200 text-sm ${
          flash
            ? "bg-amber-100 hover:bg-amber-200"
            : "hover:bg-skin-table-hover"
        } px-2 py-3`}
      >
        <span className="col-span-2">
          <TransactionLink txHash={tx.hash} fail={tx.status === 0} />
        </span>
        {tx.to !== null ? <MethodName data={tx.data} /> : <span></span>}
        <span>
          <BlockLink blockTag={tx.blockNumber} />
        </span>
        <TimestampAge timestamp={tx.timestamp} />
        <span className="col-span-2 flex items-baseline justify-between space-x-2 pr-2">
          <span className="truncate">
            {tx.from && (
              <TransactionAddress
                address={tx.from}
                selectedAddress={selectedAddress}
                miner={tx.miner === tx.from}
              />
            )}
          </span>
          <span>
            <TransactionDirection
              direction={direction}
              flags={sendsToMiner ? Flags.MINER : undefined}
            />
          </span>
        </span>
        <span
          className="col-span-2 flex items-baseline"
          title={tx.to ?? tx.createdContractAddress}
        >
          <span className="truncate">
            {tx.to ? (
              <TransactionAddress
                address={tx.to}
                selectedAddress={selectedAddress}
                miner={tx.miner === tx.to}
                showCodeIndicator
              />
            ) : (
              <TransactionAddress
                address={tx.createdContractAddress!}
                selectedAddress={selectedAddress}
                creation
                showCodeIndicator
              />
            )}
          </span>
        </span>
        <span className="col-span-2 truncate">
          <NativeTokenAmount value={tx.value} />
        </span>
        <span className="truncate font-balance text-xs text-gray-500">
          {feeDisplay === FeeDisplay.TX_FEE && formatValue(tx.fee, 18)}
          {feeDisplay === FeeDisplay.TX_FEE_USD && (
            <TransactionItemFiatFee blockTag={tx.blockNumber} fee={tx.fee} />
          )}
          {feeDisplay === FeeDisplay.GAS_PRICE && formatValue(tx.gasPrice, 9)}
        </span>
      </div>
    </BlockNumberContext.Provider>
  );
};

export default TransactionItem;
