import { FC, PropsWithChildren, useContext, useState } from "react";
import _NavButton from "../../components/NavButton";
import { RuntimeContext } from "../../useRuntime";
import { useTransactionBySenderAndNonce } from "../../useErigonHooks";
import { ChecksummedAddress } from "../../types";
import { addressByNonceURL } from "../../url";

// TODO: extract common component with block/NavButton
type NavButtonProps = {
  sender: ChecksummedAddress;
  nonce: bigint;
  disabled?: boolean;
};

const NavButton: FC<PropsWithChildren<NavButtonProps>> = ({
  sender,
  nonce,
  disabled,
  children,
}) => {
  const [prefetch, setPrefetch] = useState<boolean>(false);

  if (disabled) {
    return (
      <_NavButton href="" disabled>
        {children}
      </_NavButton>
    );
  }

  return (
    <>
      <_NavButton
        href={addressByNonceURL(sender, nonce)}
        onMouseOver={() => setPrefetch(true)}
      >
        {children}
      </_NavButton>
      {prefetch && <Prefetcher checksummedAddress={sender} nonce={nonce} />}
    </>
  );
};

type PrefetcherProps = {
  checksummedAddress: ChecksummedAddress;
  nonce: bigint;
};

const Prefetcher: FC<PrefetcherProps> = ({ checksummedAddress, nonce }) => {
  const { provider } = useContext(RuntimeContext);
  const _txHash = useTransactionBySenderAndNonce(
    provider,
    checksummedAddress,
    nonce
  );

  return <></>;
};

export default NavButton;
