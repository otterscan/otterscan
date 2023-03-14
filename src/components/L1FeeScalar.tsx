import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { commify, formatUnits } from "@ethersproject/units";

type L1FeeScalarProps = {
  value: BigNumber;
};

const L1FeeScalar: React.FC<L1FeeScalarProps> = ({ value }) => {
  return <>{commify(formatUnits(value, 0))}</>;
};

export default React.memo(L1FeeScalar);
