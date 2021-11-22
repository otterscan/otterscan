import React from "react";
import TransactionAddress from "../../components/TransactionAddress";
import Copy from "../../components/Copy";
import { ResolvedAddresses } from "../../api/address-resolver";

type AddressDecoderProps = {
  r: string;
  resolvedAddresses?: ResolvedAddresses | undefined;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({
  r,
  resolvedAddresses,
}) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <TransactionAddress address={r} resolvedAddresses={resolvedAddresses} />
    <Copy value={r} />
  </div>
);

export default AddressDecoder;
