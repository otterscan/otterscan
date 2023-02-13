import { FC, memo } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { commify, formatUnits } from "@ethersproject/units";

type FormatterBalanceProps = {
  value: BigNumber;
  decimals?: number;
  symbol?: string | undefined;
};

// TODO: remove duplication with TransactionValue component
const FormattedBalance: FC<FormatterBalanceProps> = ({
  value,
  decimals = 18,
  symbol,
}) => {
  const formatted = commify(formatUnits(value, decimals));
  const stripZeroDec = formatted.endsWith(".0")
    ? formatted.slice(0, formatted.length - 2)
    : formatted;

  return (
    <>
      {stripZeroDec}
      {symbol != undefined ? " " + symbol : ""}
    </>
  );
};

export default memo(FormattedBalance);
