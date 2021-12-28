import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import NavButton from "./NavButton";
import { ChecksummedAddress } from "../types";
import { RuntimeContext } from "../useRuntime";
import {
  prefetchTransactionBySenderAndNonce,
  useTransactionBySenderAndNonce,
  useTransactionCount,
} from "../useErigonHooks";
import { useSWRConfig } from "swr";

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

  // Prefetch
  const swrConfig = useSWRConfig();
  const prefetch = () => {
    if (provider && sender && nonce !== undefined) {
      prefetchTransactionBySenderAndNonce(
        swrConfig,
        provider,
        sender,
        nonce - 2
      );
      prefetchTransactionBySenderAndNonce(
        swrConfig,
        provider,
        sender,
        nonce + 2
      );
    }
  };

  return (
    <div className="pl-2 self-center flex space-x-1" onMouseEnter={prefetch}>
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
