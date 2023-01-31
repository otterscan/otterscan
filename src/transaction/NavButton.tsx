import React, { PropsWithChildren, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { RuntimeContext } from "../useRuntime";
import { useTransactionBySenderAndNonce } from "../useErigonHooks";
import { ChecksummedAddress } from "../types";
import { addressByNonceURL } from "../url";

// TODO: extract common component with block/NavButton
type NavButtonProps = {
  sender: ChecksummedAddress;
  nonce: number;
  disabled?: boolean;
};

const NavButton: React.FC<PropsWithChildren<NavButtonProps>> = ({
  sender,
  nonce,
  disabled,
  children,
}) => {
  const [prefetch, setPrefetch] = useState<boolean>(false);

  if (disabled) {
    return (
      <span className="rounded bg-link-blue/10 px-2 py-1 text-xs text-gray-300">
        {children}
      </span>
    );
  }

  return (
    <>
      <NavLink
        className="rounded bg-link-blue/10 px-2 py-1 text-xs text-link-blue hover:bg-link-blue/100 hover:text-white"
        to={addressByNonceURL(sender, nonce)}
        onMouseOver={() => setPrefetch(true)}
      >
        {children}
      </NavLink>
      {prefetch && <Prefetcher checksummedAddress={sender} nonce={nonce} />}
    </>
  );
};

type PrefetcherProps = {
  checksummedAddress: ChecksummedAddress;
  nonce: number;
};

const Prefetcher: React.FC<PrefetcherProps> = ({
  checksummedAddress,
  nonce,
}) => {
  const { provider } = useContext(RuntimeContext);
  const _txHash = useTransactionBySenderAndNonce(
    provider,
    checksummedAddress,
    nonce
  );

  return <></>;
};

export default NavButton;
