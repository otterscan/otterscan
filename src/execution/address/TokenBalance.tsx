import { FC, useContext } from "react";
import { getPriceOraclePreset } from "../../components/FiatValue";
import USDAmount from "../../components/USDAmount";
import { useTokenBalance } from "../../ots2/usePrototypeTransferHooks";
import FormattedBalanceHighlighter from "../../selection/FormattedBalanceHighlighter";
import { ChecksummedAddress } from "../../types";
import { useTokenMetadata } from "../../useErigonHooks";
import { useTokenUSDOracle } from "../../usePriceOracle";
import { RuntimeContext } from "../../useRuntime";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";

type TokenBalanceProps = {
  holderAddress: ChecksummedAddress;
  tokenAddress: ChecksummedAddress;
};

const TokenBalance: FC<TokenBalanceProps> = ({
  holderAddress,
  tokenAddress,
}) => {
  const { provider } = useContext(RuntimeContext);
  const balance = useTokenBalance(provider, holderAddress, tokenAddress);
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
    <tr>
      <td>
        <TransactionAddressWithCopy address={tokenAddress} />
      </td>
      <td>
        {balance !== null && balance !== undefined && (
          <FormattedBalanceHighlighter
            value={balance}
            decimals={metadata?.decimals ?? 0}
          />
        )}
        {balance !== null &&
          balance !== undefined &&
          metadata &&
          quote !== undefined &&
          decimals !== undefined && (
            <USDAmount
              amount={balance}
              amountDecimals={metadata.decimals}
              quote={quote}
              quoteDecimals={Number(decimals ?? 0)}
              colorScheme={getPriceOraclePreset(priceSource)}
            />
          )}
      </td>
    </tr>
  );
};

export default TokenBalance;
