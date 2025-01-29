import { FC, memo } from "react";
import StandardTHead from "../components/StandardTHead";
import { FeeDisplay } from "./useFeeToggler";

export type ResultHeaderProps = {
  feeDisplay: FeeDisplay;
  feeDisplayToggler: () => void;
};

const ResultHeader: FC<ResultHeaderProps> = ({
  feeDisplay,
  feeDisplayToggler,
}) => (
  <StandardTHead>
    <th className="4xl:w-152">Txn Hash</th>
    <th>Method</th>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
    <th className="4xl:w-md">From</th>
    <th className="4xl:w-md">To</th>
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

export default memo(ResultHeader);
