import React, { useContext } from "react";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { useSelectedTransaction } from "../useSelectedTransaction";
import { useBlockNumberContext } from "../useBlockTagContext";
import { RuntimeContext } from "../useRuntime";
import { useHasCode } from "../useErigonHooks";
import { AddressContext, ChecksummedAddress } from "../types";

type TransactionAddressProps = {
  address: ChecksummedAddress;
  addressCtx?: AddressContext | undefined;
  showCodeIndicator?: boolean;
};

const TransactionAddress: React.FC<TransactionAddressProps> = ({
  address,
  addressCtx,
  showCodeIndicator = false,
}) => {
  const txData = useSelectedTransaction();
  // TODO: push down creation coloring logic into DecoratedAddressLink
  const creation = address === txData?.confirmedData?.createdContractAddress;

  const { provider } = useContext(RuntimeContext);
  const blockNumber = useBlockNumberContext();
  const toHasCode = useHasCode(
    provider,
    address,
    blockNumber !== undefined
      ? blockNumber === "latest"
        ? "latest"
        : blockNumber - 1
      : undefined
  );

  return (
    <AddressHighlighter address={address}>
      <DecoratedAddressLink
        address={address}
        addressCtx={addressCtx}
        miner={address === txData?.confirmedData?.miner}
        txFrom={address === txData?.from}
        txTo={address === txData?.to || creation}
        creation={creation}
        eoa={
          showCodeIndicator && blockNumber !== undefined
            ? !toHasCode
            : undefined
        }
      />
    </AddressHighlighter>
  );
};

export default TransactionAddress;
