import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons";
import TransactionAddress from "./components/TransactionAddress";
import ValueHighlighter from "./components/ValueHighlighter";
import FormattedBalance from "./components/FormattedBalance";
import USDAmount from "./components/USDAmount";
import { RuntimeContext } from "./useRuntime";
import { useBlockNumberContext } from "./useBlockTagContext";
import { useTokenMetadata } from "./useErigonHooks";
import { useTokenUSDOracle } from "./usePriceOracle";
import { AddressContext, TokenTransfer } from "./types";

type TokenTransferItemProps = {
  t: TokenTransfer;
};

const TokenTransferItem: React.FC<TokenTransferItemProps> = ({ t }) => {
  const { provider } = useContext(RuntimeContext);
  const blockNumber = useBlockNumberContext();
  const [quote, decimals] = useTokenUSDOracle(provider, blockNumber, t.token);
  const tokenMeta = useTokenMetadata(provider, t.token);

  return (
    <div className="flex items-baseline space-x-2 px-2 py-1 truncate hover:bg-gray-100">
      <div className="grid grid-cols-4 gap-x-1 w-full items-baseline">
        <div className="flex items-baseline space-x-1">
          <TransactionAddress
            address={t.from}
            addressCtx={AddressContext.FROM}
            showCodeIndicator
          />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faCaretRight} size="1x" />
          </span>
          <TransactionAddress
            address={t.to}
            addressCtx={AddressContext.TO}
            showCodeIndicator
          />
        </div>
        <div className="col-span-2 flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faSackDollar} size="1x" />
          </span>
          <span>
            <ValueHighlighter value={t.value}>
              <FormattedBalance
                value={t.value}
                decimals={tokenMeta?.decimals ?? 0}
              />
            </ValueHighlighter>
          </span>
          <TransactionAddress address={t.token} />
          {tokenMeta && quote !== undefined && decimals !== undefined && (
            <span className="px-2 border-gray-200 border rounded-lg bg-gray-100 text-gray-600">
              <USDAmount
                amount={t.value}
                amountDecimals={tokenMeta.decimals}
                quote={quote}
                quoteDecimals={decimals}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TokenTransferItem);
