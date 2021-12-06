import React from "react";
import { BlockTag } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import MethodName from "../components/MethodName";
import BlockLink from "../components/BlockLink";
import TransactionLink from "../components/TransactionLink";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import TimestampAge from "../components/TimestampAge";
import AddressHighlighter from "../components/AddressHighlighter";
import TransactionDirection, {
  Direction,
  Flags,
} from "../components/TransactionDirection";
import TransactionValue from "../components/TransactionValue";
import { ChecksummedAddress, ProcessedTransaction } from "../types";
import { FeeDisplay } from "./useFeeToggler";
import { formatValue } from "../components/formatter";
import ETH2USDValue from "../components/ETH2USDValue";
import { ResolvedAddresses } from "../api/address-resolver";
import { Metadata } from "../sourcify/useSourcify";

type TransactionItemProps = {
  tx: ProcessedTransaction;
  resolvedAddresses?: ResolvedAddresses;
  selectedAddress?: string;
  feeDisplay: FeeDisplay;
  priceMap: Record<BlockTag, BigNumber>;
  metadatas: Record<ChecksummedAddress, Metadata | null | undefined>;
};

const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  resolvedAddresses,
  selectedAddress,
  feeDisplay,
  priceMap,
  metadatas,
}) => {
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

  const flash = tx.gasPrice.isZero() && tx.internalMinerInteraction;

  return (
    <div
      className={`grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 ${
        flash
          ? "bg-yellow-100 hover:bg-yellow-200"
          : "hover:bg-skin-table-hover"
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
      {tx.to !== null ? <MethodName data={tx.data} /> : <span></span>}
      <span>
        <BlockLink blockTag={tx.blockNumber} />
      </span>
      <TimestampAge timestamp={tx.timestamp} />
      <span className="col-span-2 flex justify-between items-baseline space-x-2 pr-2">
        <span className="truncate">
          {tx.from && (
            <AddressHighlighter address={tx.from}>
              <DecoratedAddressLink
                address={tx.from}
                selectedAddress={selectedAddress}
                miner={tx.miner === tx.from}
                resolvedAddresses={resolvedAddresses}
              />
            </AddressHighlighter>
          )}
        </span>
        <span>
          <TransactionDirection
            direction={direction}
            flags={tx.internalMinerInteraction ? Flags.MINER : undefined}
          />
        </span>
      </span>
      <span
        className="col-span-2 flex items-baseline"
        title={tx.to ?? tx.createdContractAddress}
      >
        <span className="truncate">
          {tx.to ? (
            <AddressHighlighter address={tx.to}>
              <DecoratedAddressLink
                address={tx.to}
                selectedAddress={selectedAddress}
                miner={tx.miner === tx.to}
                resolvedAddresses={resolvedAddresses}
                metadata={metadatas[tx.to]}
              />
            </AddressHighlighter>
          ) : (
            <AddressHighlighter address={tx.createdContractAddress!}>
              <DecoratedAddressLink
                address={tx.createdContractAddress!}
                selectedAddress={selectedAddress}
                creation
                resolvedAddresses={resolvedAddresses}
                metadata={metadatas[tx.createdContractAddress!]}
              />
            </AddressHighlighter>
          )}
        </span>
      </span>
      <span className="col-span-2 truncate">
        <TransactionValue value={tx.value} />
      </span>
      <span className="font-balance text-xs text-gray-500 truncate">
        {feeDisplay === FeeDisplay.TX_FEE && formatValue(tx.fee, 18)}
        {feeDisplay === FeeDisplay.TX_FEE_USD &&
          (priceMap[tx.blockNumber] ? (
            <ETH2USDValue
              ethAmount={tx.fee}
              eth2USDValue={priceMap[tx.blockNumber]}
            />
          ) : (
            "N/A"
          ))}
        {feeDisplay === FeeDisplay.GAS_PRICE && formatValue(tx.gasPrice, 9)}
      </span>
    </div>
  );
};

export default TransactionItem;
