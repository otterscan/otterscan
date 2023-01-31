import React from "react";
import { NavLink } from "react-router-dom";
import { transactionURL } from "../url";

type TransactionLinkProps = {
  txHash: string;
};

const TransactionLink: React.FC<TransactionLinkProps> = ({ txHash }) => (
  <NavLink
    className="font-hash text-link-blue hover:text-link-blue-hover"
    to={transactionURL(txHash)}
  >
    <p className="truncate">{txHash}</p>
  </NavLink>
);

export default React.memo(TransactionLink);
