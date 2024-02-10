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
    <th>Txn Hash</th>
    <th>Method</th>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
    <th>From</th>
    <th>To</th>
    <th className="min-w-52">Value</th>
    <th>
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
