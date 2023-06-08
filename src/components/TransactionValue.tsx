import { FC, memo } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useChainInfo } from "../useChainInfo";
import FormattedBalance from "./FormattedBalance";

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
 */
const TransactionValue: FC<TransactionValueProps> = ({ value, hideUnit }) => {
  const {
    nativeCurrency: { symbol, decimals },
  } = useChainInfo();

  return (
    <span className={`text-sm ${value.isZero() ? "opacity-30" : ""}`}>
      <FormattedBalance
        value={value}
        decimals={decimals}
        symbol={hideUnit ? undefined : symbol}
      />
    </span>
  );
};

export default memo(TransactionValue);
