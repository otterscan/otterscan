import { FC, memo } from "react";
import FormattedBalance from "./FormattedBalance";

type RelevantNumericValueProps = {
  value: number;
};

/**
 * Standard component for displaying amounts. It:
 *
 * - Commify non-decimal parts, i.e., 1,000,000.00
 * - Light gray absolute zero values
 */
const RelevantNumericValue: FC<RelevantNumericValueProps> = ({ value }) => (
  <FormattedBalance value={BigInt(value)} decimals={0} />
);

export default memo(RelevantNumericValue);
