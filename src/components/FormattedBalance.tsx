import { FC, memo } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { formatValue } from "./formatter";

const DEFAULT_DECIMALS = 18;

export type FormattedBalanceProps = {
  value: BigNumber;
  decimals?: number;
  symbol?: string | undefined;
};

// TODO: remove duplication with TransactionValue component
const FormattedBalance: FC<FormattedBalanceProps> = ({
  value,
  decimals = DEFAULT_DECIMALS,
  symbol,
}) => {
  const formattedValue = formatValue(value, decimals);

  return (
    <>
      {formattedValue}
      {symbol != undefined ? " " + symbol : ""}
    </>
  );
};

export default memo(FormattedBalance);
