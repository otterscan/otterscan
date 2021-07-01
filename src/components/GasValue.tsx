import React from "react";
import { BigNumber, ethers } from "ethers";

type GasValueProps = {
  value: BigNumber;
};

const GasValue: React.FC<GasValueProps> = ({ value }) => {
  return <>{ethers.utils.commify(ethers.utils.formatUnits(value, 0))}</>;
};

export default React.memo(GasValue);
