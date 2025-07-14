import { FC, memo } from "react";
import StandardTHead from "../components/StandardTHead";
import { FeeDisplay, ValueDisplay } from "./useFeeToggler";

export type ResultHeaderProps = {
  feeDisplay: FeeDisplay;
  feeDisplayToggler: () => void;
  valueDisplay: ValueDisplay;
  valueDisplayToggler: () => void;
};

const ResultHeader: FC<ResultHeaderProps> = ({
  feeDisplay,
  feeDisplayToggler,
  valueDisplay,
  valueDisplayToggler,
}) => (
  <StandardTHead>
    <th className="4xl:w-152">Txn Hash</th>
    <th>Method</th>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
    <th className="min-w-52 xl:min-w-64 4xl:w-md 5xl:w-xl">From</th>
    <th className="min-w-52 xl:min-w-64 4xl:w-md 5xl:w-xl">To</th>
    <th className="min-w-52">
      <div className="@container">
        <div className="hidden @2xs:block">Value</div>
        <div className="@2xs:hidden">
          <button
            className="text-link-blue hover:text-link-blue-hover"
            onClick={valueDisplayToggler}
          >
            {valueDisplay === ValueDisplay.VALUE_NATIVE && "Value"}
            {valueDisplay === ValueDisplay.VALUE_USD && "Value (USD)"}
          </button>
        </div>
      </div>
    </th>
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
