import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons/faCaretRight";
import TransactionAddress from "./components/TransactionAddress";
import ValueHighlighter from "./components/ValueHighlighter";
import FormattedBalance from "./components/FormattedBalance";
import {
  AddressContext,
  ChecksummedAddress,
  TokenMeta,
  TokenTransfer,
} from "./types";
import { Metadata } from "./sourcify/useSourcify";

type TokenTransferItemProps = {
  t: TokenTransfer;
  tokenMeta?: TokenMeta | null | undefined;
  metadatas: Record<ChecksummedAddress, Metadata | null | undefined>;
};

// TODO: handle partial
const TokenTransferItem: React.FC<TokenTransferItemProps> = ({
  t,
  tokenMeta,
  metadatas,
}) => {
  return (
    <div className="flex items-baseline space-x-2 px-2 py-1 truncate hover:bg-gray-100">
      <span className="text-gray-500">
        <FontAwesomeIcon icon={faCaretRight} size="1x" />
      </span>
      <div className="grid grid-cols-7 gap-x-1 w-full">
        <div className="col-span-2 flex space-x-1">
          <span className="font-bold">From</span>
          <TransactionAddress
            address={t.from}
            addressCtx={AddressContext.FROM}
            metadata={metadatas[t.from]}
            showCodeIndicator
          />
        </div>
        <div className="col-span-2 flex space-x-1">
          <span className="font-bold">To</span>
          <TransactionAddress
            address={t.to}
            addressCtx={AddressContext.TO}
            metadata={metadatas[t.to]}
            showCodeIndicator
          />
        </div>
        <div className="col-span-3 flex space-x-1">
          <span className="font-bold">For</span>
          <span>
            <ValueHighlighter value={t.value}>
              <FormattedBalance
                value={t.value}
                decimals={tokenMeta?.decimals ?? 0}
              />
            </ValueHighlighter>
          </span>
          <TransactionAddress address={t.token} metadata={metadatas[t.token]} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(TokenTransferItem);
