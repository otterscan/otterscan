import { BigNumberish, formatUnits } from "ethers";
import { commify } from "../utils/utils";

export const formatValue = (value: BigNumberish, decimals: number): string => {
  const formatted = commify(formatUnits(value, decimals));
  return formatted.endsWith(".0")
    ? formatted.slice(0, formatted.length - 2)
    : formatted;
};

/**
 * Trims a BigInt to either a minimum number of significant figures or decimal
 * places, whichever gives more decimal places.
 *
 * @param num - The number to trim
 * @param decimals - Decimal places num is supposed to have
 * @param minSigFigs - Minimum significant figures to keep
 * @param minDecimals - Minimum decimal places to keep
 * @returns The trimmed number
 */
export function trimToPrecision(
  num: bigint,
  decimals: number,
  minSigFigs: number,
  minDecimals: number,
): bigint {
  const totalFigures = num.toString().length;
  const figuresToCut = Math.max(
    Math.min(decimals - minDecimals, totalFigures - minSigFigs),
    0,
  );
  const roundingValue = 10n ** BigInt(figuresToCut);
  return (num / roundingValue) * roundingValue;
}
