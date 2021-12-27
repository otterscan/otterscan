import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import NavButton from "./NavButton";
import { ChecksummedAddress } from "../types";
import { RuntimeContext } from "../useRuntime";
import {
  useTransactionBySenderAndNonce,
  useTransactionCount,
} from "../useErigonHooks";

type NavNonceProps = {
  sender: ChecksummedAddress;
  nonce: number;
};

const NavNonce: React.FC<NavNonceProps> = ({ sender, nonce }) => {
  const { provider } = useContext(RuntimeContext);
  const prevTxHash = useTransactionBySenderAndNonce(
    provider,
    sender,
    nonce - 1
  );
  const nextTxHash = useTransactionBySenderAndNonce(
    provider,
    sender,
    nonce + 1
  );
  const count = useTransactionCount(provider, sender);
  const lastTxHash = useTransactionBySenderAndNonce(
    provider,
    sender,
    count !== undefined ? count - 1 : undefined
  );

  return (
    <div className="pl-2 self-center flex space-x-1">
      <NavButton txHash={prevTxHash} disabled={nonce === 0}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </NavButton>
      <NavButton
        txHash={nextTxHash}
        disabled={count === undefined || nonce >= count - 1}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </NavButton>
      <NavButton
        txHash={lastTxHash}
        disabled={count === undefined || nonce >= count - 1}
      >
        <FontAwesomeIcon icon={faChevronRight} />
        <FontAwesomeIcon icon={faChevronRight} />
      </NavButton>
    </div>
  );
};

export default React.memo(NavNonce);
