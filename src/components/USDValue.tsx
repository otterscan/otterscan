import React from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";

const ETH_FEED_DECIMALS = 8;

type USDValueProps = {
  value: BigNumber | undefined;
};

const USDValue: React.FC<USDValueProps> = ({ value }) => (
  <span className="text-sm">
    {value ? (
      <>
        $
        <span className="font-balance">
          {commify(
            FixedNumber.fromValue(value, ETH_FEED_DECIMALS).round(2).toString()
          )}
        </span>{" "}
        <span className="text-xs text-gray-500">/ ETH</span>
      </>
    ) : (
      "N/A"
    )}
  </span>
);

export default React.memo(USDValue);
