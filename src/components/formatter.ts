import { BigNumberish } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";
import { commify } from "../utils/utils";

export const formatValue = (value: BigNumberish, decimals: number): string => {
  const formatted = commify(formatUnits(value, decimals));
  return formatted.endsWith(".0")
    ? formatted.slice(0, formatted.length - 2)
    : formatted;
};
