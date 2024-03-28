import { FixedNumber } from "ethers";
import { FC, memo } from "react";
import FiatValue, { FiatBoxProps, neutralPreset } from "./FiatValue";

type USDAmountProps = {
  amount: bigint;
  amountDecimals: number;
  quote: bigint;
  quoteDecimals: number;
  colorScheme?: FiatBoxProps;
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
  colorScheme = neutralPreset,
}) => {
  const value = amount * quote;
  const decimals = amountDecimals + quoteDecimals;
  const fiatAmount = FixedNumber.fromValue(
    value,
    decimals,
    `ufixed512x${decimals}`,
  );

  return <FiatValue value={fiatAmount} {...colorScheme} />;
};

export default memo(USDAmount);
