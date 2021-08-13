import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { formatValue } from "./formatter";

type TransactionValueProps = {
  value: BigNumber;
  decimals?: number;
  hideUnit?: boolean;
};

const TransactionValue: React.FC<TransactionValueProps> = ({
  value,
  decimals = 18,
  hideUnit,
}) => {
  const formattedValue = formatValue(value, decimals);

  return (
    <span
      className={`text-sm ${value.isZero() ? "text-gray-400" : ""}`}
      title={`${formattedValue} Ether`}
    >
      <span className={`font-balance`}>{formattedValue}</span>
      {!hideUnit && " Ether"}
    </span>
  );
};

export default React.memo(TransactionValue);
