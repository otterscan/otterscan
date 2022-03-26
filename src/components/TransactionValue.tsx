import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useChainInfo } from "../useChainInfo";
import { formatValue } from "./formatter";

type TransactionValueProps = {
  value: BigNumber;
  hideUnit?: boolean;
};

/**
 * Standard component for displaying balances. It:
 *
 * - Commify non-decimal parts, i.e., 1,000,000.00
 * - Light gray absolute zero values
 * - Cut out decimal part is it is 0 to reduce UI clutter, i.e., show
 * 123 instead of 123.00
 *
 * TODO: remove duplication with FormattedBalance
 */
const TransactionValue: React.FC<TransactionValueProps> = ({
  value,
  hideUnit,
}) => {
  const { nativeSymbol, nativeDecimals } = useChainInfo();
  const formattedValue = formatValue(value, nativeDecimals);

  return (
    <span
      className={`text-sm ${value.isZero() ? "text-gray-400" : ""}`}
      title={`${formattedValue} ${nativeSymbol}`}
    >
      <span className={`font-balance`}>{formattedValue}</span>
      {!hideUnit && ` ${nativeSymbol}`}
    </span>
  );
};

export default React.memo(TransactionValue);
