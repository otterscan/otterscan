import { FC, memo, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import TransactionAddress from "../components/TransactionAddress";
import FormattedBalanceHighlighter from "../../selection/FormattedBalanceHighlighter";
import USDAmount from "../../components/USDAmount";
import { RuntimeContext } from "../../useRuntime";
import { useBlockNumberContext } from "../../useBlockTagContext";
import { useTokenMetadata } from "../../useErigonHooks";
import { useTokenUSDOracle } from "../../usePriceOracle";
import { AddressContext, TokenTransfer } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";

type TokenTransferItemProps = {
  t: TokenTransfer;
};

const TokenTransferItem: FC<TokenTransferItemProps> = ({ t }) => {
  const { provider } = useContext(RuntimeContext);
  const blockNumber = useBlockNumberContext();
  let [quote, decimals]: [BigNumber | undefined, number | undefined] = [
    undefined,
    undefined,
  ];
  if (t.type === "erc20") {
    [quote, decimals] = useTokenUSDOracle(provider, blockNumber, t.token);
  }
  const tokenMeta = useTokenMetadata(provider, t.token);

  let tokenExtra: false | JSX.Element | string | null | undefined = <></>;
  if (t.type === "erc20") {
    tokenExtra = tokenMeta &&
      quote !== undefined &&
      decimals !== undefined &&
      t.value !== undefined && (
        <USDAmount
          amount={t.value}
          amountDecimals={tokenMeta.decimals}
          quote={quote}
          quoteDecimals={decimals}
        />
      );
  } else if (t.type === "erc721") {
    tokenExtra = "ERC-721: Token #" + t.tokenId?.toString();
  }

  return (
    <div className="flex items-baseline space-x-2 truncate px-2 py-1 hover:bg-gray-100">
      <div className="grid w-full grid-cols-4 items-baseline gap-x-1">
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
            <FormattedBalanceHighlighter
              value={t.value ?? t.tokenId ?? BigNumber.from(0)}
              decimals={tokenMeta?.decimals ?? 0}
            />
          </span>
          <TransactionAddress address={t.token} />
          {tokenExtra}
        </div>
      </div>
    </div>
  );
};

export default memo(TokenTransferItem);
