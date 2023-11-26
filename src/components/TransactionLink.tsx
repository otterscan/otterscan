import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { transactionURL } from "../url";

type TransactionLinkProps = {
  txHash: string;
  fail?: boolean;
};

const TransactionLink: FC<TransactionLinkProps> = ({ txHash, fail }) => (
  <span className="flex-no-wrap flex space-x-1">
    {fail && (
      <span className="text-red-600" title="Transaction reverted">
        <FontAwesomeIcon icon={faExclamationCircle} />
      </span>
    )}
    <span className="truncate">
      <NavLink
        className="font-hash text-link-blue hover:text-link-blue-hover"
        to={transactionURL(txHash)}
      >
        <p className="truncate" data-test="tx-hash">
          {txHash}
        </p>
      </NavLink>
    </span>
  </span>
);

export default memo(TransactionLink);
