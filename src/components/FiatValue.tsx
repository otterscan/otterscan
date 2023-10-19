import { FixedNumber } from "ethers";
import { FC, memo } from "react";
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
    $<span className="font-balance">{formatFiatValue(value, decimals)}</span>
  </span>
);

export default memo(FiatValue);
