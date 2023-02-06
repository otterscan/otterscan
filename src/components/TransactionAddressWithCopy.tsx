import { FC } from "react";
import TransactionAddress, {
  TransactionAddressProps,
} from "./TransactionAddress";
import Copy from "./Copy";

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
