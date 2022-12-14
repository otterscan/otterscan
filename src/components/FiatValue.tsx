import { FC, memo } from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";

type FiatValueProps = {
  value: BigNumber;
};

/**
 * Basic display of ETH -> USD values WITHOUT box decoration, only
 * text formatting.
 *
 * USD amounts are displayed commified with 2 decimals places and $ prefix,
 * i.e., "$1,000.00".
 */
const FiatValue: FC<FiatValueProps> = ({ value }) => (
  <span className="text-xs">
    $
    <span className="font-balance">
      {commify(FixedNumber.fromValue(value, 18).round(2).toString())}
    </span>
  </span>
);

export default memo(FiatValue);
