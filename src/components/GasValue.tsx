import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { commify, formatUnits } from "@ethersproject/units";

type GasValueProps = {
  value: BigNumber;
};

const GasValue: React.FC<GasValueProps> = ({ value }) => {
  return <>{commify(formatUnits(value, 0))}</>;
};

export default React.memo(GasValue);
