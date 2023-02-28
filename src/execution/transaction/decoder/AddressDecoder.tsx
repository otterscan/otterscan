import { FC } from "react";
import TransactionAddressWithCopy from "../../../components/TransactionAddressWithCopy";
import { ChecksummedAddress } from "../../../types";

type AddressDecoderProps = {
  r: ChecksummedAddress;
};

const AddressDecoder: FC<AddressDecoderProps> = ({ r }) => (
  <TransactionAddressWithCopy address={r} showCodeIndicator />
);

export default AddressDecoder;
