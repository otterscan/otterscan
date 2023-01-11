import { FC, useContext } from "react";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import ValueHighlighter from "../components/ValueHighlighter";
import FormattedBalance from "../components/FormattedBalance";
import { ChecksummedAddress } from "../types";
import { RuntimeContext } from "../useRuntime";
import {
  useERC20Metadata,
  useTokenBalance,
  useTokenMetadata,
} from "../useErigonHooks";
import { useTokenUSDOracle } from "../usePriceOracle";
import USDAmount from "../components/USDAmount";

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
        <DecoratedAddressLink address={tokenAddress} />
      </td>
      <td>
        {balance && (
          <ValueHighlighter value={balance}>
            <FormattedBalance
              value={balance}
              decimals={metadata?.decimals ?? 0}
            />
          </ValueHighlighter>
        )}
        {balance &&
          metadata &&
          quote !== undefined &&
          decimals !== undefined && (
            <span className="px-2 border-gray-200 border rounded-lg bg-gray-100 text-gray-600">
              <USDAmount
                amount={balance}
                amountDecimals={metadata.decimals}
                quote={quote}
                quoteDecimals={decimals}
              />
            </span>
          )}
      </td>
    </tr>
  );
};

export default TokenBalance;
