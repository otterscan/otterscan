import { faCaretRight, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo, useContext } from "react";
import { getPriceOraclePreset } from "../../components/FiatValue";
import USDAmount from "../../components/USDAmount";
import FormattedBalanceHighlighter from "../../selection/FormattedBalanceHighlighter";
import { AddressContext, TokenTransfer } from "../../types";
import { useBlockNumberContext } from "../../useBlockTagContext";
import { useTokenMetadata } from "../../useErigonHooks";
import { useTokenUSDOracle } from "../../usePriceOracle";
import { RuntimeContext } from "../../useRuntime";
import TransactionAddress from "../components/TransactionAddress";
import NftIcon from "./nft-icon.svg";

type TokenTransferItemProps = {
  t: TokenTransfer;
};

const TokenTransferItem: FC<TokenTransferItemProps> = ({ t }) => {
  const { provider } = useContext(RuntimeContext);
  const blockNumber = useBlockNumberContext();
  const tokenMeta = useTokenMetadata(provider, t.token);
  // NOTE: Prices are estimated from the previous block so as not to skew the
  // estimate in favor of future price movements within this block, including
  // those possibly coming from this transaction.
  const {
    price: quote,
    decimals,
    source: priceSource,
  } = useTokenUSDOracle(
    provider,
    typeof blockNumber === "number" ? blockNumber - 1 : blockNumber,
    t.type === "erc20" ? t.token : undefined,
    tokenMeta?.decimals !== undefined ? BigInt(tokenMeta?.decimals) : undefined,
  );

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
          {t.type === "erc20" && (
            <span>
              <span className="text-gray-500">
                <FontAwesomeIcon icon={faSackDollar} size="1x" />
              </span>
              <FormattedBalanceHighlighter
                value={t.value}
                decimals={tokenMeta?.decimals ?? 0}
              />
            </span>
          )}
          {t.type === "erc721" && (
            <span className="inline-flex items-baseline">
              <span>
                {/* For the same height as the FA icons, use h-[1em] [vertical-align:-0.125em] */}
                <img
                  src={NftIcon}
                  title="NFT"
                  className="inline-block h-[1.5em] [vertical-align:-0.375em]"
                />
              </span>
              <span className="px-1">NFT #{t.tokenId}</span>
            </span>
          )}
          <TransactionAddress address={t.token} />
          {t.type === "erc20" &&
            tokenMeta &&
            quote !== undefined &&
            decimals !== undefined && (
              <USDAmount
                amount={t.value}
                amountDecimals={tokenMeta.decimals}
                quote={quote}
                quoteDecimals={Number(decimals ?? 0)}
                colorScheme={getPriceOraclePreset(priceSource)}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(TokenTransferItem);
