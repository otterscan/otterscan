import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
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
    <span className="font-bold">From</span>
    <AddressLink address={t.from} />
    <span className="font-bold">To</span>
    <AddressLink address={t.to} />
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
            text={`${tokenMetas[t.token].name} (${tokenMetas[t.token].symbol})`}
          />
        </>
      ) : (
        <AddressLink address={t.token} />
      )}
    </span>
  </div>
);

export default React.memo(TokenTransferItem);
