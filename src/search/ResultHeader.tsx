import React from "react";
import StandardTHead from "../components/StandardTHead";
import { FeeDisplay } from "./useFeeToggler";

export type ResultHeaderProps = {
  feeDisplay: FeeDisplay;
  feeDisplayToggler: () => void;
};

const ResultHeader: React.FC<ResultHeaderProps> = ({
  feeDisplay,
  feeDisplayToggler,
}) => (
  <StandardTHead>
    <th className="min-w-16 max-w-50">Txn Hash</th>
    <th className="min-w-16 max-w-32">Method</th>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
    <th>From</th>
    <th>To</th>
    <th className="min-w-16 max-w-42">Value</th>
    <th className="min-w-16 max-w-24">
      <button
        className="text-link-blue hover:text-link-blue-hover"
        onClick={feeDisplayToggler}
      >
        {feeDisplay === FeeDisplay.TX_FEE && "Txn Fee"}
        {feeDisplay === FeeDisplay.TX_FEE_USD && "Txn Fee (USD)"}
        {feeDisplay === FeeDisplay.GAS_PRICE && "Gas Price"}
      </button>
    </th>
  </StandardTHead>
);

export default React.memo(ResultHeader);
