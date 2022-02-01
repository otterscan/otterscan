import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StandardFrame from "./StandardFrame";
import AddressOrENSNameInvalidNonce from "./components/AddressOrENSNameInvalidNonce";
import AddressOrENSNameNoTx from "./components/AddressOrENSNameNoTx";
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

  // Calculate txCount ONLY when asked for latest nonce
  const [txCount, setTxCount] = useState<number | undefined>();
  useEffect(() => {
    if (!provider || !checksummedAddress || rawNonce !== "latest") {
      setTxCount(undefined);
      return;
    }

    const readTxCount = async () => {
      const count = await provider.getTransactionCount(checksummedAddress);
      setTxCount(count);
    };
    readTxCount();
  }, [provider, checksummedAddress, rawNonce]);

  // Determine desired nonce from parse int query param or txCount - 1 nonce
  // in case of latest
  let nonce: number | undefined;
  if (rawNonce === "latest") {
    if (txCount !== undefined) {
      nonce = txCount - 1;
    }
  } else {
    nonce = parseInt(rawNonce, 10);
    if (nonce < 0) {
      nonce = NaN;
    }
  }

  // Given all base params are determined, get the corresponding tx
  const txHash = useTransactionBySenderAndNonce(
    provider,
    checksummedAddress,
    nonce !== undefined && isNaN(nonce) ? undefined : nonce
  );
  const navigate = useNavigate();

  // Loading...
  if (checksummedAddress === undefined || nonce === undefined) {
    return <StandardFrame />;
  }

  // Address hasn't made the first outbound tx yet
  if (nonce < 0) {
    return (
      <StandardFrame>
        <AddressOrENSNameNoTx addressOrENSName={checksummedAddress} />
      </StandardFrame>
    );
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
