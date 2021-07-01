import { ethers, BigNumber } from "ethers";

export const formatValue = (value: BigNumber, decimals: number): string => {
  const formatted = ethers.utils.commify(
    ethers.utils.formatUnits(value, decimals)
  );
  return formatted.endsWith(".0")
    ? formatted.slice(0, formatted.length - 2)
    : formatted;
};
