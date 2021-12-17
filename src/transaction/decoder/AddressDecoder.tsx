import React from "react";
import TransactionAddress from "../../components/TransactionAddress";
import Copy from "../../components/Copy";

type AddressDecoderProps = {
  r: string;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({ r }) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <TransactionAddress address={r} />
    <Copy value={r} />
  </div>
);

export default AddressDecoder;
