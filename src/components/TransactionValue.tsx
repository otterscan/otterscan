import React from "react";
import { BigNumber } from "ethers";
import { formatValue } from "./formatter";

type TransactionValueProps = {
  value: BigNumber;
  decimals?: number;
};

const TransactionValue: React.FC<TransactionValueProps> = ({
  value,
  decimals = 18,
}) => {
  const formattedValue = formatValue(value, decimals);

  return (
    <span
      className={`text-sm ${value.isZero() ? "text-gray-400" : ""}`}
      title={`${formattedValue} Ether`}
    >
      <span className={`font-balance`}>{formattedValue}</span> Ether
    </span>
  );
};

export default React.memo(TransactionValue);
