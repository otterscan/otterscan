import { FC } from "react";
import Copy from "../../components/Copy";
import TransactionAddress, {
  TransactionAddressProps,
} from "./TransactionAddress";

const TransactionAddressWithCopy: FC<TransactionAddressProps> = ({
  address,
  ...rest
}) => (
  <div className="-ml-1 flex items-baseline space-x-2">
    <TransactionAddress address={address} {...rest} />
    <Copy value={address} />
  </div>
);

export default TransactionAddressWithCopy;
