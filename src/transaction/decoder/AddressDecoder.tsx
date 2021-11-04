import React from "react";
import AddressHighlighter from "../../components/AddressHighlighter";
import DecoratedAddressLink from "../../components/DecoratedAddressLink";
import Copy from "../../components/Copy";
import { TransactionData } from "../../types";
import { ResolvedAddresses } from "../../api/address-resolver";

type AddressDecoderProps = {
  r: any;
  txData: TransactionData;
  resolvedAddresses?: ResolvedAddresses | undefined;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({
  r,
  txData,
  resolvedAddresses,
}) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <AddressHighlighter address={r.toString()}>
      <DecoratedAddressLink
        address={r.toString()}
        miner={r.toString() === txData.confirmedData?.miner}
        txFrom={r.toString() === txData.from}
        txTo={r.toString() === txData.to}
        resolvedAddresses={resolvedAddresses}
      />
    </AddressHighlighter>
    <Copy value={r.toString()} />
  </div>
);

export default React.memo(AddressDecoder);
