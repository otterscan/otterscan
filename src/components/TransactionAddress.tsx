import React from "react";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { ResolvedAddresses } from "../api/address-resolver";
import { useSelectedTransaction } from "../useSelectedTransaction";
import { AddressContext } from "../types";
import { Metadata } from "../useSourcify";

type TransactionAddressProps = {
  address: string;
  addressCtx?: AddressContext | undefined;
  resolvedAddresses: ResolvedAddresses | undefined;
  metadata?: Metadata | null | undefined;
};

const TransactionAddress: React.FC<TransactionAddressProps> = ({
  address,
  addressCtx,
  resolvedAddresses,
  metadata,
}) => {
  const txData = useSelectedTransaction();
  // TODO: push down creation coloring logic into DecoratedAddressLink
  const creation = address === txData?.confirmedData?.createdContractAddress;

  return (
    <AddressHighlighter address={address}>
      <DecoratedAddressLink
        address={address}
        addressCtx={addressCtx}
        miner={address === txData?.confirmedData?.miner}
        txFrom={address === txData?.from}
        txTo={address === txData?.to || creation}
        creation={creation}
        resolvedAddresses={resolvedAddresses}
        metadata={metadata}
      />
    </AddressHighlighter>
  );
};

export default TransactionAddress;
