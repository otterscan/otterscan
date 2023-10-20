import React, { useContext } from "react";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import TransactionItemFiatFee from "./TransactionItemFiatFee";
import { FeeDisplay } from "./useFeeToggler";
import { RuntimeContext } from "../useRuntime";
import { ExtendedBlock } from "../useErigonHooks";
import { formatValue } from "../components/formatter";
import { blockTxsURL } from "../url";
import { NavLink } from "react-router-dom";
import BlockReward from "../execution/components/BlockReward";

type BlockItemProps = {
  block: ExtendedBlock,
  feeDisplay: FeeDisplay
};

const RecentBlockItem: React.FC<BlockItemProps> = ({ block, feeDisplay}) => {

  return (
    <div
    className="grid grid-cols-5 items-baseline gap-x-1 border-t border-gray-200 text-sm 
    hover:bg-skin-table-hover px-2 py-3"
    >
    <span>
    <BlockLink blockTag={block.number} />
    </span>
    <span>
    <NavLink
        className="rounded-lg bg-link-blue/10 px-2 py-1 text-xs text-link-blue hover:bg-link-blue/100 hover:text-white"
        to={blockTxsURL(block.number)}
    >
        {block.transactionCount} transactions
    </NavLink>
    </span>
    <span className="truncate font-balance text-xs text-gray-500">
        {feeDisplay === FeeDisplay.TX_FEE && formatValue(block.feeReward, 18)}
        {feeDisplay === FeeDisplay.TX_FEE_USD && (
        <TransactionItemFiatFee blockTag={block.number} fee={block.feeReward} />
        )}
        {feeDisplay === FeeDisplay.GAS_PRICE && formatValue(block.gasUsed, 9)}
    </span>
    <span className="truncate">
        <BlockReward block={block} />
    </span>
    <TimestampAge timestamp={block.timestamp}/>
    </div>
  );
};

export default RecentBlockItem;
