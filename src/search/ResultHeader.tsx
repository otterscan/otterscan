import React from "react";
import { FeeDisplay } from "./useFeeToggler";

export type ResultHeaderProps = {
  feeDisplay: FeeDisplay;
  feeDisplayToggler: () => void;
};

const ResultHeader: React.FC<ResultHeaderProps> = ({
  feeDisplay,
  feeDisplayToggler,
}) => (
  <div className="grid grid-cols-12 gap-x-1 bg-gray-100 border-t border-b border-gray-200 px-2 py-2 font-bold text-gray-500 text-sm">
    <div className="col-span-2">Txn Hash</div>
    <div>Method</div>
    <div>Block</div>
    <div>Age</div>
    <div className="col-span-2 ml-1">From</div>
    <div className="col-span-2 ml-1">To</div>
    <div className="col-span-2">Value</div>
    <div>
      <button
        className="text-link-blue hover:text-link-blue-hover"
        onClick={feeDisplayToggler}
      >
        {feeDisplay === FeeDisplay.TX_FEE ? "Txn Fee" : "Gas Price"}
      </button>
    </div>
  </div>
);

export default React.memo(ResultHeader);
