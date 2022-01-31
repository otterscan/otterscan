import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import StandardFrame from "./StandardFrame";
import AddressOrENSNameInvalidNonce from "./components/AddressOrENSNameInvalidNonce";
import { ChecksummedAddress } from "./types";
import { transactionURL } from "./url";
import { useTransactionBySenderAndNonce } from "./useErigonHooks";
import { RuntimeContext } from "./useRuntime";

type AddressTransactionByNonceProps = {
  checksummedAddress: ChecksummedAddress | undefined;
  nonce: number | undefined;
};

const AddressTransactionByNonce: React.FC<AddressTransactionByNonceProps> = ({
  checksummedAddress,
  nonce,
}) => {
  const { provider } = useContext(RuntimeContext);
  const txHash = useTransactionBySenderAndNonce(
    provider,
    checksummedAddress,
    nonce
  );
  const navigate = useNavigate();

  if (checksummedAddress !== undefined && nonce === undefined) {
    return (
      <StandardFrame>
        <AddressOrENSNameInvalidNonce
          addressOrENSName={checksummedAddress}
          nonce={"undefined"}
        />
      </StandardFrame>
    );
  }
  if (
    checksummedAddress !== undefined &&
    nonce !== undefined &&
    txHash === null
  ) {
    return (
      <StandardFrame>
        <AddressOrENSNameInvalidNonce
          addressOrENSName={checksummedAddress}
          nonce={nonce.toString()}
        />
      </StandardFrame>
    );
  }
  if (txHash) {
    navigate(transactionURL(txHash));
  }
  return <StandardFrame />;
};

export default AddressTransactionByNonce;
