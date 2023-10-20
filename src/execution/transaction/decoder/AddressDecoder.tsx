import { FC } from "react";
import { ChecksummedAddress } from "../../../types";
import TransactionAddressWithCopy from "../../components/TransactionAddressWithCopy";

type AddressDecoderProps = {
  r: ChecksummedAddress;
};

const AddressDecoder: FC<AddressDecoderProps> = ({ r }) => (
  <TransactionAddressWithCopy address={r} showCodeIndicator />
);

export default AddressDecoder;
