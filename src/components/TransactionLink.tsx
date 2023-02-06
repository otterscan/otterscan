import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { transactionURL } from "../url";

type TransactionLinkProps = {
  txHash: string;
};

const TransactionLink: FC<TransactionLinkProps> = ({ txHash }) => (
  <NavLink
    className="font-hash text-link-blue hover:text-link-blue-hover"
    to={transactionURL(txHash)}
  >
    <p className="truncate">{txHash}</p>
  </NavLink>
);

export default memo(TransactionLink);
