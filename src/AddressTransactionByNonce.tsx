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
  rawNonce: string;
};

const AddressTransactionByNonce: React.FC<AddressTransactionByNonceProps> = ({
  checksummedAddress,
  rawNonce,
}) => {
  const { provider } = useContext(RuntimeContext);

  const nonce = parseInt(rawNonce, 10);
  const txHash = useTransactionBySenderAndNonce(
    provider,
    checksummedAddress,
    isNaN(nonce) ? undefined : nonce
  );
  const navigate = useNavigate();

  if (checksummedAddress === undefined) {
    return <StandardFrame />;
  }

  // Garbage nonce
  if (isNaN(nonce)) {
    return (
      <StandardFrame>
        <AddressOrENSNameInvalidNonce
          addressOrENSName={checksummedAddress}
          nonce={rawNonce}
        />
      </StandardFrame>
    );
  }

  // Valid nonce, but no tx found
  if (!txHash) {
    return (
      <StandardFrame>
        <AddressOrENSNameInvalidNonce
          addressOrENSName={checksummedAddress}
          nonce={nonce.toString()}
        />
      </StandardFrame>
    );
  }

  // Success; replace and render filler
  navigate(transactionURL(txHash), { replace: true });
  return <StandardFrame />;
};

export default AddressTransactionByNonce;
