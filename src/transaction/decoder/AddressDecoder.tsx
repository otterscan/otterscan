import React from "react";
import AddressHighlighter from "../../components/AddressHighlighter";
import DecoratedAddressLink from "../../components/DecoratedAddressLink";
import Copy from "../../components/Copy";
import { TransactionData } from "../../types";
import { ResolvedAddresses } from "../../api/address-resolver";

type AddressDecoderProps = {
  r: string;
  txData: TransactionData;
  resolvedAddresses?: ResolvedAddresses | undefined;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({
  r,
  txData,
  resolvedAddresses,
}) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <AddressHighlighter address={r}>
      <DecoratedAddressLink
        address={r}
        miner={r === txData.confirmedData?.miner}
        txFrom={r === txData.from}
        txTo={r === txData.to}
        resolvedAddresses={resolvedAddresses}
      />
    </AddressHighlighter>
    <Copy value={r} />
  </div>
);

export default AddressDecoder;
