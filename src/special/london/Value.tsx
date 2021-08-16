import React from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";

type ValueProps = {
  value: BigNumber;
};

const Value: React.FC<ValueProps> = ({ value }) => (
  <div className="flex items-baseline space-x-1">
    <span>{commify(FixedNumber.fromValue(value, 18).round(2).toString())}</span>
    <span className="text-xs text-gray-500">ETH</span>
  </div>
);

export default React.memo(Value);
