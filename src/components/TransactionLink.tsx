import React from "react";
import { NavLink } from "react-router-dom";
import { transactionURL } from "../url";

type TransactionLinkProps = {
  txHash: string;
};

const TransactionLink: React.FC<TransactionLinkProps> = ({ txHash }) => (
  <NavLink
    className="text-link-blue hover:text-link-blue-hover font-hash"
    to={transactionURL(txHash)}
  >
    <p className="truncate">{txHash}</p>
  </NavLink>
);

export default React.memo(TransactionLink);
