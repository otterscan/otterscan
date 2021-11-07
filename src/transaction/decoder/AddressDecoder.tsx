import React from "react";
import Copy from "../../components/Copy";
import { ResolvedAddresses } from "../../api/address-resolver";
import TransactionAddress from "../../components/TransactionAddress";

type AddressDecoderProps = {
  r: any;
  resolvedAddresses?: ResolvedAddresses | undefined;
};

const AddressDecoder: React.FC<AddressDecoderProps> = ({
  r,
  resolvedAddresses,
}) => (
  <div className="flex items-baseline space-x-2 -ml-1 mr-3">
    <TransactionAddress
      address={r.toString()}
      resolvedAddresses={resolvedAddresses}
    />
    <Copy value={r.toString()} />
  </div>
);

export default React.memo(AddressDecoder);
