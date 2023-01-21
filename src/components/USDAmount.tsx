import { FC, memo } from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";

const USD_DECIMALS = 2;

type USDAmountProps = {
  amount: BigNumber;
  amountDecimals: number;
  quote: BigNumber;
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
  const value = amount.mul(quote);
  const decimals = amountDecimals + quoteDecimals;

  return (
    <span className="px-2 border-gray-200 border rounded-lg bg-gray-100 text-xs text-gray-600">
      $
      <span className="font-balance">
        {commify(
          FixedNumber.fromValue(value, decimals, `ufixed256x${decimals}`)
            .round(USD_DECIMALS)
            .toString()
        )}
      </span>
    </span>
  );
};

export default memo(USDAmount);
