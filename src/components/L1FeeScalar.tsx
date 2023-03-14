import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { commify, formatUnits } from "@ethersproject/units";

type L1FeeScalarProps = {
  value: number;
};

const L1FeeScalar: React.FC<L1FeeScalarProps> = ({ value }) => {
  return <>{commify(value)}</>;
};

export default React.memo(L1FeeScalar);
