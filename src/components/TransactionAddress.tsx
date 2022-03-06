import React from "react";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { useSelectedTransaction } from "../useSelectedTransaction";
import { AddressContext } from "../types";
import { Metadata } from "../sourcify/useSourcify";

type TransactionAddressProps = {
  address: string;
  addressCtx?: AddressContext | undefined;
  metadata?: Metadata | null | undefined;
  eoa?: boolean | undefined;
};

const TransactionAddress: React.FC<TransactionAddressProps> = ({
  address,
  addressCtx,
  metadata,
  eoa,
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
        metadata={metadata}
        eoa={eoa}
      />
    </AddressHighlighter>
  );
};

export default TransactionAddress;
