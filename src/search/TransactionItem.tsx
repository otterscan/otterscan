import React, { useContext } from "react";
import BlockLink from "../components/BlockLink";
import MethodName from "../components/MethodName";
import NativeTokenAmount from "../components/NativeTokenAmount";
import TimestampAge from "../components/TimestampAge";
import TransactionDirection, {
  Direction,
  Flags,
} from "../components/TransactionDirection";
import TransactionLink from "../components/TransactionLink";
import { formatValue } from "../components/formatter";
import TransactionAddress from "../execution/components/TransactionAddress";
import { ProcessedTransaction } from "../types";
import { BlockNumberContext } from "../useBlockTagContext";
import { useSendsToMiner } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import TransactionItemFiatFee from "./TransactionItemFiatFee";
import { FeeDisplay } from "./useFeeToggler";

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

  const flash = tx.gasPrice === 0n && sendsToMiner;

  return (
    <BlockNumberContext.Provider value={tx.blockNumber}>
      <tr>
        <td className="max-w-36">
          <TransactionLink
            txHash={tx.hash}
            fail={tx.status === 0}
            blob={tx.type === 3}
          />
        </td>
        {/* Set min-w-36 to reduce changing column widths when methods of different lengths show*/}
        <td className="max-w-24 min-w-24">
          {tx.to !== null && <MethodName data={tx.data} to={tx.to} />}
        </td>
        <td className="max-w-28">
          <BlockLink blockTag={tx.blockNumber} />
        </td>
        <td className="max-w-24">
          <TimestampAge timestamp={tx.timestamp} />
        </td>
        <td className="max-w-48">
          <span className="col-span-2 flex items-baseline justify-between space-x-2 pr-2">
            <span className="truncate">
              {tx.from && (
                <TransactionAddress
                  address={tx.from}
                  selectedAddress={selectedAddress}
                />
              )}
            </span>
            <span>
              <TransactionDirection
                direction={undefined}
                flags={sendsToMiner ? Flags.MINER : undefined}
              />
            </span>
          </span>
        </td>
        <td className="max-w-48">
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
        </td>
        <td className="min-w-28 max-w-28">
          <NativeTokenAmount value={tx.value} />
        </td>
        <td className="min-w-24 max-w-24">
          <span className="truncate font-balance text-xs text-gray-500">
            {feeDisplay === FeeDisplay.TX_FEE && formatValue(tx.fee, 18)}
            {feeDisplay === FeeDisplay.TX_FEE_USD && (
              <TransactionItemFiatFee blockTag={tx.blockNumber} fee={tx.fee} />
            )}
            {feeDisplay === FeeDisplay.GAS_PRICE && formatValue(tx.gasPrice, 9)}
          </span>
        </td>
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default TransactionItem;
