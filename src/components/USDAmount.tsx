import { FC, memo } from "react";
import { FixedNumber } from "ethers";
import FiatValue, { neutralPreset } from "./FiatValue";

type USDAmountProps = {
  amount: bigint;
  amountDecimals: number;
  quote: bigint;
  quoteDecimals: number;
};

// TODO: fix the duplication mess with other currency display components

/**
 * USD amounts are displayed commified with 2 decimals places and $ prefix,
 * i.e., "$1,000.00".
 */
const USDAmount: FC<USDAmountProps> = ({
  amount,
  amountDecimals,
  quote,
  quoteDecimals,
}) => {
  const value = amount * quote;
  const decimals = amountDecimals + quoteDecimals;
  const fiatAmount = FixedNumber.fromValue(
    value,
    decimals,
    `ufixed256x${decimals}`,
  );

  return <FiatValue value={fiatAmount} {...neutralPreset} />;
};

export default memo(USDAmount);
