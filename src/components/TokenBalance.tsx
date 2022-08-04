import React, { useContext } from "react";
import TransactionAddress from "./TransactionAddress";
import ValueHighlighter from "./ValueHighlighter";
import FormattedBalance from "./FormattedBalance";
import USDAmount from "./USDAmount";
import { ChecksummedAddress } from "../types";
import { useTokenBalance, useTokenMetadata } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import { useTokenUSDOracle } from "../usePriceOracle";

type TokenBalanceProps = {
  address: ChecksummedAddress;
  token: ChecksummedAddress;
};

const TokenBalance: React.FC<TokenBalanceProps> = ({ address, token }) => {
  const { provider } = useContext(RuntimeContext);
  const b = useTokenBalance(provider, address, token);
  const [quote, decimals] = useTokenUSDOracle(provider, "latest", token);
  const tokenMeta = useTokenMetadata(provider, token);

  return (
    <div className="flex items-baseline">
      {b && tokenMeta && (
        <ValueHighlighter value={b}>
          <FormattedBalance value={b} decimals={tokenMeta.decimals} />
        </ValueHighlighter>
      )}
      <TransactionAddress address={token} />
      {tokenMeta && b && quote !== undefined && decimals !== undefined && (
        <span className="px-2 border-gray-200 border rounded-lg bg-gray-100 text-gray-600">
          <USDAmount
            amount={b}
            amountDecimals={tokenMeta.decimals}
            quote={quote}
            quoteDecimals={decimals}
          />
        </span>
      )}
    </div>
  );
};

export default TokenBalance;
