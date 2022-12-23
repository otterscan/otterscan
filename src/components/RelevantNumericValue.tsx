import { FC, memo } from "react";
import { formatValue } from "./formatter";

type RelevantNumericValueProps = {
  value: number;
};

/**
 * Standard component for displaying amounts. It:
 *
 * - Commify non-decimal parts, i.e., 1,000,000.00
 * - Light gray absolute zero values
 */
const RelevantNumericValue: FC<RelevantNumericValueProps> = ({ value }) => {
  const formattedValue = formatValue(value, 0);

  return (
    <span
      className={`text-sm ${value === 0 ? "text-gray-400" : ""}`}
      title={`${formattedValue}`}
    >
      {formattedValue}
    </span>
  );
};

export default memo(RelevantNumericValue);
