import { FC, memo } from "react";
import { FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";

const DEFAULT_DECIMALS = 2;

type FiatValueProps = {
  value: FixedNumber;
  decimals?: number;
  borderColor?: string;
  bgColor?: string;
  fgColor?: string;
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
    $
    <span className="font-balance">
      {commify(value.round(decimals).toString())}
    </span>
  </span>
);

export default memo(FiatValue);
