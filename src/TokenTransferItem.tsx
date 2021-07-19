import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import AddressHighlighter from "./components/AddressHighlighter";
import DecoratedAddressLink from "./components/DecoratedAddressLink";
import FormattedBalance from "./components/FormattedBalance";
import {
  AddressContext,
  TokenMetas,
  TokenTransfer,
  TransactionData,
} from "./types";

type TokenTransferItemProps = {
  t: TokenTransfer;
  txData: TransactionData;
  tokenMetas: TokenMetas;
};

const TokenTransferItem: React.FC<TokenTransferItemProps> = ({
  t,
  txData,
  tokenMetas,
}) => (
  <div className="flex items-baseline space-x-2 px-2 py-1 truncate hover:bg-gray-100">
    <span className="text-gray-500">
      <FontAwesomeIcon icon={faCaretRight} size="1x" />
    </span>
    <div className="grid grid-cols-5 gap-x-1">
      <div className="flex space-x-1">
        <span className="font-bold">From</span>
        <AddressHighlighter address={t.from}>
          <DecoratedAddressLink
            address={t.from}
            addressCtx={AddressContext.FROM}
            txFrom={t.from === txData.from}
            txTo={t.from === txData.to}
          />
        </AddressHighlighter>
      </div>
      <div className="flex space-x-1">
        <span className="font-bold">To</span>
        <AddressHighlighter address={t.to}>
          <DecoratedAddressLink
            address={t.to}
            addressCtx={AddressContext.TO}
            txFrom={t.to === txData.from}
            txTo={t.to === txData.to}
          />
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
        <AddressHighlighter address={t.token}>
          <DecoratedAddressLink
            address={t.token}
            text={
              tokenMetas[t.token]
                ? `${tokenMetas[t.token].name} (${tokenMetas[t.token].symbol})`
                : ""
            }
            tokenMeta={tokenMetas[t.token]}
          />
        </AddressHighlighter>
      </div>
    </div>
  </div>
);

export default React.memo(TokenTransferItem);
