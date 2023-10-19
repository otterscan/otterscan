import { FC, useContext } from "react";
import AddressHighlighter from "../../components/AddressHighlighter";
import { AddressContext, ChecksummedAddress } from "../../types";
import { useBlockNumberContext } from "../../useBlockTagContext";
import { useBlockDataFromTransaction, useHasCode } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { useSelectedTransaction } from "../../useSelectedTransaction";
import { AddressAwareComponentProps } from "../types";
import DecoratedAddressLink from "./DecoratedAddressLink";

export type TransactionAddressProps = AddressAwareComponentProps & {
  selectedAddress?: ChecksummedAddress | undefined;
  addressCtx?: AddressContext | undefined;
  creation?: boolean | undefined;
  miner?: boolean | undefined;
  showCodeIndicator?: boolean;
};

const TransactionAddress: FC<TransactionAddressProps> = ({
  address,
  selectedAddress,
  addressCtx,
  creation,
  miner,
  showCodeIndicator = false,
}) => {
  const txData = useSelectedTransaction();
  // TODO: push down creation coloring logic into DecoratedAddressLink
  const _creation =
    creation || address === txData?.confirmedData?.createdContractAddress;

  const { provider } = useContext(RuntimeContext);
  const block = useBlockDataFromTransaction(provider, txData);

  const blockNumber = useBlockNumberContext();
  const hasCode = useHasCode(
    provider,
    address,
    blockNumber !== undefined
      ? blockNumber === "latest"
        ? "latest"
        : blockNumber - 1
      : undefined,
  );

  return (
    <AddressHighlighter address={address}>
      <DecoratedAddressLink
        address={address}
        selectedAddress={selectedAddress}
        addressCtx={addressCtx}
        miner={miner || address === block?.miner}
        txFrom={address === txData?.from}
        txTo={address === txData?.to || _creation}
        creation={_creation}
        eoa={
          showCodeIndicator
            ? creation || blockNumber !== undefined
              ? hasCode !== undefined
                ? !hasCode
                : undefined
              : undefined
            : undefined
        }
      />
    </AddressHighlighter>
  );
};

export default TransactionAddress;
