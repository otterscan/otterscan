import React, { useContext } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import ValueHighlighter from "./ValueHighlighter";
import FormattedBalance from "./FormattedBalance";
import TransactionAddress from "./TransactionAddress";
import USDAmount from "./USDAmount";
import { useBlockNumberContext } from "../useBlockTagContext";
import { useTokenUSDOracle } from "../usePriceOracle";
import { RuntimeContext } from "../useRuntime";
import { ChecksummedAddress } from "../types";

// INFINITE === > 1 trillion
const MIN_INFINITE = BigNumber.from("1000000000000000000000000000000");

type AllowanceAmountProps = {
  value: BigNumber;
  token: ChecksummedAddress;
};

const AllowanceAmount: React.FC<AllowanceAmountProps> = ({ value, token }) => {
  const isInfinite = value.gte(MIN_INFINITE);

  const { provider } = useContext(RuntimeContext);
  const blockNumber = useBlockNumberContext();
  const [quote, decimals] = useTokenUSDOracle(provider, blockNumber, token);

  return (
    <>
      <span>
        {isInfinite ? (
          <span className="font-bold text-red-600">
            &infin; INFINITE &infin;
          </span>
        ) : (
          <ValueHighlighter value={value}>
            <FormattedBalance value={value} decimals={18} />
          </ValueHighlighter>
        )}
      </span>
      <TransactionAddress address={token} />
      {!isInfinite && quote !== undefined && decimals !== undefined && (
        <span className="px-2 border-gray-200 border rounded-lg bg-gray-100 text-gray-600">
          <USDAmount
            amount={value}
            amountDecimals={18}
            quote={quote}
            quoteDecimals={decimals}
          />
        </span>
      )}
    </>
  );
};

export default AllowanceAmount;
