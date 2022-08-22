import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import StandardFrame from "./StandardFrame";
import AddressOrENSNameNotFound from "./components/AddressOrENSNameNotFound";
import AddressOrENSNameInvalidNonce from "./components/AddressOrENSNameInvalidNonce";
import AddressOrENSNameNoTx from "./components/AddressOrENSNameNoTx";
import { useTransactionBySenderAndNonce } from "./useErigonHooks";
import { RuntimeContext } from "./useRuntime";
import { useAddressOrENS } from "./useResolvedAddresses";
import { ChecksummedAddress } from "./types";
import { transactionURL } from "./url";

type AddressTransactionByNonceProps = {
  rawNonce: string;
};

const AddressTransactionByNonce: React.FC<AddressTransactionByNonceProps> = ({
  rawNonce,
}) => {
  const { provider } = useContext(RuntimeContext);

  const { addressOrName, direction } = useParams();
  if (addressOrName === undefined) {
    throw new Error("addressOrName couldn't be undefined here");
  }

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFixer = useCallback(
    (address: ChecksummedAddress) => {
      navigate(
        `/address/${address}${
          direction ? "/" + direction : ""
        }?${searchParams.toString()}`,
        { replace: true }
      );
    },
    [navigate, direction, searchParams]
  );
  const [checksummedAddress, , ensError] = useAddressOrENS(
    addressOrName,
    urlFixer
  );

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

  // Invalid ENS
  if (ensError) {
    return (
      <StandardFrame>
        <AddressOrENSNameNotFound
          addressOrENSName={addressOrName}
          supportsENS={provider?.network.ensAddress !== undefined}
        />
      </StandardFrame>
    );
  }

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

  // Valid nonce, waiting tx load
  if (txHash === undefined) {
    return <StandardFrame />;
  }

  // Valid nonce, but no tx found
  if (txHash === null) {
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
