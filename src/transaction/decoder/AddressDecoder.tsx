import React from "react";
import TransactionAddress from "../../components/TransactionAddress";
import Copy from "../../components/Copy";
import { ChecksummedAddress } from "../../types";

type AddressDecoderProps = {
  r: ChecksummedAddress;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({ r }) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <TransactionAddress address={r} showCodeIndicator />
    <Copy value={r} />
  </div>
);

export default AddressDecoder;
