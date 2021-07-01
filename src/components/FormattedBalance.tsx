import React from "react";
import { ethers, BigNumber } from "ethers";

type FormatterBalanceProps = {
  value: BigNumber;
  decimals?: number;
};

const FormattedBalance: React.FC<FormatterBalanceProps> = ({
  value,
  decimals = 18,
}) => {
  const formatted = ethers.utils.commify(
    ethers.utils.formatUnits(value, decimals)
  );
  const stripZeroDec = formatted.endsWith(".0")
    ? formatted.slice(0, formatted.length - 2)
    : formatted;

  return <>{stripZeroDec}</>;
};

export default React.memo(FormattedBalance);
