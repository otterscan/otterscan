import { BigNumberish } from "ethers";
import { formatUnits } from "ethers";
import { commify } from "../utils/utils";

export const formatValue = (value: BigNumberish, decimals: number): string => {
  const formatted = commify(formatUnits(value, decimals));
  return formatted.endsWith(".0")
    ? formatted.slice(0, formatted.length - 2)
    : formatted;
};
