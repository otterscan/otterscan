import { FC, memo } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useChainInfo } from "../useChainInfo";
import FormattedBalance from "./FormattedBalance";

type NativeTokenAmountProps = {
  value: BigNumber;
  hideUnit?: boolean;
};

/**
 * Standard component for displaying a certain amount of native chain token
 * (i.e. ETH). It:
 *
 * - Commify non-decimal parts, i.e., 1,000,000.00
 * - Light gray absolute zero values
 * - Cut out decimal part if it is 0 to reduce UI clutter, i.e., show
 * 123 instead of 123.00
 */
const NativeTokenAmount: FC<NativeTokenAmountProps> = ({ value, hideUnit }) => {
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

export default memo(NativeTokenAmount);
