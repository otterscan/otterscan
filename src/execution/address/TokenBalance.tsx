import { FC, useContext } from "react";
import Copy from "../../components/Copy";
import USDAmount from "../../components/USDAmount";
import { useTokenBalance } from "../../ots2/usePrototypeTransferHooks";
import FormattedBalanceHighlighter from "../../selection/FormattedBalanceHighlighter";
import { ChecksummedAddress } from "../../types";
import { useTokenMetadata } from "../../useErigonHooks";
import { useTokenUSDOracle } from "../../usePriceOracle";
import { RuntimeContext } from "../../useRuntime";
import DecoratedAddressLink from "../components/DecoratedAddressLink";

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
  const [quote, decimals] = useTokenUSDOracle(provider, "latest", tokenAddress);

  return (
    <tr>
      <td>
        <div className="flex items-baseline space-x-2">
          <DecoratedAddressLink address={tokenAddress} />
          <Copy value={tokenAddress} />
        </div>
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
              quoteDecimals={decimals}
            />
          )}
      </td>
    </tr>
  );
};

export default TokenBalance;
