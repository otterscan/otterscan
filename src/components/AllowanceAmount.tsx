import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import ValueHighlighter from "./ValueHighlighter";
import FormattedBalance from "./FormattedBalance";

// INFINITE === > 1 trillion
const MIN_INFINITE = BigNumber.from("1000000000000000000000000000000");

type AllowanceAmountProps = {
  value: BigNumber;
};

const AllowanceAmount: React.FC<AllowanceAmountProps> = ({ value }) => {
  const isInfinite = value.gte(MIN_INFINITE);

  return (
    <span>
      {isInfinite ? (
        <span className="font-bold text-red-600">&infin; INFINITE &infin;</span>
      ) : (
        <ValueHighlighter value={value}>
          <FormattedBalance value={value} decimals={18} />
        </ValueHighlighter>
      )}
    </span>
  );
};

export default AllowanceAmount;
