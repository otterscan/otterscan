import React from "react";
import { NavLink } from "react-router-dom";

type TransactionLinkProps = {
  txHash: string;
};

const TransactionLink: React.FC<TransactionLinkProps> = ({ txHash }) => (
  <NavLink
    className="text-link-blue hover:text-link-blue-hover font-hash"
    to={`/tx/${txHash}`}
  >
    <p className="truncate">{txHash}</p>
  </NavLink>
);

export default React.memo(TransactionLink);
