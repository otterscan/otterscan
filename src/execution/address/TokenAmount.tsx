import { FC, useContext } from "react";
import USDAmount from "../../components/USDAmount";
import FormattedBalanceHighlighter from "../../selection/FormattedBalanceHighlighter";
import { ChecksummedAddress } from "../../types";
import { useTokenMetadata } from "../../useErigonHooks";
import { useTokenUSDOracle } from "../../usePriceOracle";
import { RuntimeContext } from "../../useRuntime";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";

type TokenAmountProps = {
  tokenAddress: ChecksummedAddress;
  amount?: bigint | null;
};

const TokenAmount: FC<TokenAmountProps> = ({ tokenAddress, amount }) => {
  const { provider } = useContext(RuntimeContext);
  const metadata = useTokenMetadata(provider, tokenAddress);
  const [quote, decimals] = useTokenUSDOracle(provider, "latest", tokenAddress);

  return (
    <>
      <td>
        <TransactionAddressWithCopy address={tokenAddress} />
      </td>
      <td>
        {amount !== null && amount !== undefined && (
          <FormattedBalanceHighlighter
            value={amount}
            decimals={metadata?.decimals ?? 0}
          />
        )}
        {amount !== null &&
          amount !== undefined &&
          metadata &&
          quote !== undefined &&
          decimals !== undefined && (
            <USDAmount
              amount={amount}
              amountDecimals={metadata.decimals}
              quote={quote}
              quoteDecimals={decimals}
            />
          )}
      </td>
    </>
  );
};

export default TokenAmount;
