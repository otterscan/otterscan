import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { commify, formatUnits } from "@ethersproject/units";

type FormatterBalanceProps = {
  value: BigNumber;
  decimals?: number;
};

// TODO: remove duplication with TransactionValue component
const FormattedBalance: React.FC<FormatterBalanceProps> = ({
  value,
  decimals = 18,
}) => {
  const formatted = commify(formatUnits(value, decimals));
  const stripZeroDec = formatted.endsWith(".0")
    ? formatted.slice(0, formatted.length - 2)
    : formatted;

  return <>{stripZeroDec}</>;
};

export default React.memo(FormattedBalance);
