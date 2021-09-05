import React from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";

type ETH2USDValueProps = {
  ethAmount: BigNumber;
  eth2USDValue: BigNumber;
};

const ETH2USDValue: React.FC<ETH2USDValueProps> = ({
  ethAmount,
  eth2USDValue,
}) => {
  const value = ethAmount.mul(eth2USDValue).div(10 ** 8);

  return (
    <span className="text-xs">
      $
      <span className="font-balance">
        {commify(FixedNumber.fromValue(value, 18).round(2).toString())}
      </span>
    </span>
  );
};

export default React.memo(ETH2USDValue);
