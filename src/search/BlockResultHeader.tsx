import React from "react";
import { FeeDisplay } from "./useFeeToggler";
import { EmptyBlocksDisplay } from "./useEmptyBlocksToggler";

export type ResultHeaderProps = {
    feeDisplay: FeeDisplay,
    emptyBlocksDisplay: EmptyBlocksDisplay,
    feeDisplayToggler: () => void,
    emptyBlocksDisplayToggler: () => void
};

const BlockResultHeader: React.FC<ResultHeaderProps> = ({
    feeDisplay,
    feeDisplayToggler,
    emptyBlocksDisplay,
    emptyBlocksDisplayToggler
}) => (
  <div className="grid grid-cols-9 gap-x-1 border-t border-b border-gray-200 bg-gray-100 px-2 py-2 text-sm font-bold text-gray-500">
    <div>Height</div>
    <div><button
  className="text-link-blue hover:text-link-blue-hover"
  onClick={emptyBlocksDisplayToggler} >
    { emptyBlocksDisplay === EmptyBlocksDisplay.SHOW_EMPTY_BLOCKS && "Txns [all-blks]" }
    { emptyBlocksDisplay === EmptyBlocksDisplay.HIDE_EMPTY_BLOCKS && "Txns [non-empty-blks]" }
  </button></div>
    <div className="col-span-4">Block Hash</div>
    <div>
      <button
        className="text-link-blue hover:text-link-blue-hover"
        onClick={feeDisplayToggler}
      >
        {feeDisplay === FeeDisplay.TX_FEE && "Txn Fee"}
        {feeDisplay === FeeDisplay.TX_FEE_USD && "Txn Fee (USD)"}
        {feeDisplay === FeeDisplay.GAS_PRICE && "Gas Price"}
      </button>
    </div>
    <div>Rewards</div>
    <div>Age</div>
  </div>
);

export default React.memo(BlockResultHeader);
