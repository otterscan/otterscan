import React from "react";
import AddressHighlighter from "../../components/AddressHighlighter";
import DecoratedAddressLink from "../../components/DecoratedAddressLink";
import Copy from "../../components/Copy";
import { SelectedTransactionContext } from "../../types";
import { ResolvedAddresses } from "../../api/address-resolver";

type AddressDecoderProps = {
  r: string;
  txContext: SelectedTransactionContext;
  resolvedAddresses?: ResolvedAddresses | undefined;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({
  r,
  txContext,
  resolvedAddresses,
}) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <AddressHighlighter address={r}>
      <DecoratedAddressLink
        address={r}
        miner={r === txContext.miner}
        txFrom={r === txContext.from}
        txTo={r === txContext.to}
        resolvedAddresses={resolvedAddresses}
      />
    </AddressHighlighter>
    <Copy value={r} />
  </div>
);

export default AddressDecoder;
