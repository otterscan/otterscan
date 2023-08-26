import { FC, memo } from "react";
import { formatValue } from "./formatter";

const DEFAULT_DECIMALS = 18;

export type FormattedBalanceProps = {
  value: bigint;
  decimals?: number;
  symbol?: string | undefined;
};

// TODO: rename it to more generic name, not for balances only
const FormattedBalance: FC<FormattedBalanceProps> = ({
  value,
  decimals = DEFAULT_DECIMALS,
  symbol,
}) => {
  const formattedValue = formatValue(value, decimals);

  return (
    <span title={`${formattedValue} ${symbol !== undefined ? symbol : ""}`}>
      <span className={`font-balance`}>{formattedValue}</span>
      {symbol !== undefined && ` ${symbol}`}
    </span>
  );
};

export default memo(FormattedBalance);
