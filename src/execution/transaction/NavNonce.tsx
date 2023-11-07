import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { ChecksummedAddress } from "../../types";
import { useTransactionCount } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import NavButton from "./NavButton";

type NavNonceProps = {
  sender: ChecksummedAddress;
  nonce: bigint;
};

const NavNonce: React.FC<NavNonceProps> = ({ sender, nonce }) => {
  const { provider } = useContext(RuntimeContext);
  const count = useTransactionCount(provider, sender);

  return (
    <div className="flex space-x-1 self-center pl-2">
      <NavButton sender={sender} nonce={nonce - 1n} disabled={nonce === 0n}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </NavButton>
      <NavButton
        sender={sender}
        nonce={nonce + 1n}
        disabled={count === undefined || nonce >= count - 1n}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </NavButton>
      <NavButton
        sender={sender}
        nonce={count !== undefined ? count - 1n : -1n}
        disabled={count === undefined || nonce >= count - 1n}
      >
        <FontAwesomeIcon icon={faChevronRight} />
        <FontAwesomeIcon icon={faChevronRight} />
      </NavButton>
    </div>
  );
};

export default React.memo(NavNonce);
