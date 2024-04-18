import { FC, useContext } from "react";
import { getPriceOraclePreset } from "../../components/FiatValue";
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
  const {
    price: quote,
    decimals,
    source: priceSource,
  } = useTokenUSDOracle(
    provider,
    "latest",
    tokenAddress,
    metadata?.decimals !== undefined ? BigInt(metadata?.decimals) : undefined,
  );

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
              quoteDecimals={Number(decimals) ?? 0}
              colorScheme={getPriceOraclePreset(priceSource)}
            />
          )}
      </td>
    </>
  );
};

export default TokenAmount;
