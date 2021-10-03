import React from "react";
import AddressHighlighter from "../../components/AddressHighlighter";
import DecoratedAddressLink from "../../components/DecoratedAddressLink";
import Copy from "../../components/Copy";
import { TransactionData } from "../../types";

type AddressDecoderProps = {
  r: any;
  txData: TransactionData;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({ r, txData }) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <AddressHighlighter address={r.toString()}>
      <DecoratedAddressLink
        address={r.toString()}
        miner={r.toString() === txData.confirmedData?.miner}
        txFrom={r.toString() === txData.from}
        txTo={r.toString() === txData.to}
      />
    </AddressHighlighter>
    <Copy value={r.toString()} />
  </div>
);

export default React.memo(AddressDecoder);
