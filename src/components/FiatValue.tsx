import { FC, memo } from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";

const USD_DECIMALS = 2;

type FiatValueProps = {
  value: BigNumber;
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
  borderColor,
  bgColor,
  fgColor,
}) => (
  <span
    className={`px-2 ${borderColor ?? ""} border rounded-lg ${bgColor ?? ""} ${
      fgColor ?? ""
    }`}
  >
    <span className="text-xs">
      $
      <span className="font-balance">
        {commify(
          FixedNumber.fromValue(value, 18).round(USD_DECIMALS).toString()
        )}
      </span>
    </span>
  </span>
);

export default memo(FiatValue);
