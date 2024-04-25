import { FixedNumber } from "ethers";
import { FC, memo } from "react";
import { PriceOracleSource } from "../api/token-price-resolver/token-price-resolver";
import { formatFiatValue } from "../usePriceOracle";

const DEFAULT_DECIMALS = 2;

export type FiatBoxProps = {
  borderColor?: string;
  bgColor?: string;
  fgColor?: string;
};

export const feePreset = {
  borderColor: "border-skin-from",
  bgColor: "bg-skin-from",
  fgColor: "text-skin-from",
} satisfies FiatBoxProps;

export const balancePreset = {
  borderColor: "border-emerald-200",
  bgColor: "bg-emerald-100",
  fgColor: "text-emerald-600",
} satisfies FiatBoxProps;

export const neutralPreset = {
  borderColor: "border-gray-200",
  bgColor: "bg-gray-100",
  fgColor: "text-gray-600",
} satisfies FiatBoxProps;

export const rewardPreset = {
  borderColor: "border-amber-200",
  bgColor: "bg-amber-100",
  fgColor: "text-amber-600",
} satisfies FiatBoxProps;

export const uniswapPreset = {
  borderColor: "border-fuchsia-200",
  bgColor: "bg-fuchsia-100",
  fgColor: "text-fuchsia-600",
} satisfies FiatBoxProps;

export function getPriceOraclePreset(
  source: PriceOracleSource | undefined,
): FiatBoxProps {
  switch (source) {
    case "Chainlink":
    case "Equivalence":
      return neutralPreset;
    case "Uniswap":
      return uniswapPreset;
  }
  return neutralPreset;
}

type FiatValueProps = FiatBoxProps & {
  value: FixedNumber;
  decimals?: number;
};

/**
 * USD amounts are displayed commified with 2 decimals places and $ prefix,
 * i.e., "$1,000.00".
 */
const FiatValue: FC<FiatValueProps> = ({
  value,
  decimals = DEFAULT_DECIMALS,
  borderColor,
  bgColor,
  fgColor,
}) => (
  <span
    className={`px-2 ${borderColor ?? ""} rounded-lg border ${
      bgColor ?? ""
    } text-xs ${fgColor ?? ""}`}
  >
    {value.isNegative() ? <span className="font-balance">-</span> : null}$
    <span className="font-balance">
      {formatFiatValue(
        value.isNegative() ? value.mul(FixedNumber.fromValue(-1n)) : value,
        decimals,
      )}
    </span>
  </span>
);

export default memo(FiatValue);
