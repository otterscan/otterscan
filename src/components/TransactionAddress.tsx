import { FC, useContext } from "react";
import { AddressAwareComponentProps } from "../execution/types";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { useSelectedTransaction } from "../useSelectedTransaction";
import { useBlockNumberContext } from "../useBlockTagContext";
import { RuntimeContext } from "../useRuntime";
import { useBlockDataFromTransaction, useHasCode } from "../useErigonHooks";
import { AddressContext } from "../types";

export type TransactionAddressProps = AddressAwareComponentProps & {
  addressCtx?: AddressContext | undefined;
  showCodeIndicator?: boolean;
};

const TransactionAddress: FC<TransactionAddressProps> = ({
  address,
  addressCtx,
  showCodeIndicator = false,
}) => {
  const txData = useSelectedTransaction();
  // TODO: push down creation coloring logic into DecoratedAddressLink
  const creation = address === txData?.confirmedData?.createdContractAddress;

  const { provider } = useContext(RuntimeContext);
  const block = useBlockDataFromTransaction(provider, txData);

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
        miner={address === block?.miner}
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
