import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import AddressHighlighter from "./components/AddressHighlighter";
import AddressOrENSName from "./components/AddressOrENSName";
import AddressLink from "./components/AddressLink";
import TokenLogo from "./components/TokenLogo";
import FormattedBalance from "./components/FormattedBalance";
import { TokenMetas, TokenTransfer } from "./types";

type TokenTransferItemProps = {
  t: TokenTransfer;
  tokenMetas: TokenMetas;
};

const TokenTransferItem: React.FC<TokenTransferItemProps> = ({
  t,
  tokenMetas,
}) => (
  <div className="flex items-baseline space-x-2 truncate">
    <span className="text-gray-500">
      <FontAwesomeIcon icon={faCaretRight} size="1x" />
    </span>
    <div className="grid grid-cols-5 gap-x-1">
      <div className="flex space-x-1">
        <span className="font-bold">From</span>
        <AddressHighlighter address={t.from}>
          <AddressOrENSName address={t.from} />
        </AddressHighlighter>
      </div>
      <div className="flex space-x-1">
        <span className="font-bold">To</span>
        <AddressHighlighter address={t.to}>
          <AddressOrENSName address={t.to} />
        </AddressHighlighter>
      </div>
      <div className="col-span-3 flex space-x-1">
        <span className="font-bold">For</span>
        <span>
          <FormattedBalance
            value={t.value}
            decimals={tokenMetas[t.token].decimals}
          />
        </span>
        <span className="flex space-x-1 items-baseline truncate">
          {tokenMetas[t.token] ? (
            <>
              <div className="self-center">
                <TokenLogo address={t.token} name={tokenMetas[t.token].name} />
              </div>
              <AddressLink
                address={t.token}
                text={`${tokenMetas[t.token].name} (${
                  tokenMetas[t.token].symbol
                })`}
              />
            </>
          ) : (
            <AddressOrENSName address={t.token} />
          )}
        </span>
      </div>
    </div>
  </div>
);

export default React.memo(TokenTransferItem);
