import React, { useContext } from "react";
import TransactionAddress from "./TransactionAddress";
import { ChecksummedAddress } from "../types";
import { useTokenBalance } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import { useTokenUSDOracle } from "../usePriceOracle";
import USDAmount from "./USDAmount";

type TokenBalanceProps = {
  address: ChecksummedAddress;
  token: ChecksummedAddress;
};

const TokenBalance: React.FC<TokenBalanceProps> = ({ address, token }) => {
  const { provider } = useContext(RuntimeContext);
  const b = useTokenBalance(provider, address, token);
  const [quote, decimals] = useTokenUSDOracle(provider, "latest", token);

  // TODO: show proper token decimals
  return (
    <div className="flex items-baseline">
      <span>{b && b.toString()}</span>
      <TransactionAddress address={token} />
      {b && quote !== undefined && decimals !== undefined && (
        <span className="px-2 border-gray-200 border rounded-lg bg-gray-100 text-gray-600">
          <USDAmount
            amount={b}
            amountDecimals={18}
            quote={quote}
            quoteDecimals={decimals}
          />
        </span>
      )}
    </div>
  );
};

export default TokenBalance;
