import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AddressOrENSNameInvalidNonce from "../components/AddressOrENSNameInvalidNonce";
import AddressOrENSNameNoTx from "../components/AddressOrENSNameNoTx";
import AddressOrENSNameNotFound from "../components/AddressOrENSNameNotFound";
import StandardFrame from "../components/StandardFrame";
import { ChecksummedAddress } from "../types";
import { transactionURL } from "../url";
import { useTransactionBySenderAndNonce } from "../useErigonHooks";
import { useAddressOrENS } from "../useResolvedAddresses";
import { RuntimeContext } from "../useRuntime";

type AddressTransactionByNonceProps = {
  rawNonce: string;
};

const AddressTransactionByNonce: React.FC<AddressTransactionByNonceProps> = ({
  rawNonce,
}) => {
  const { provider } = useContext(RuntimeContext);
  const [_, startTransition] = useTransition();

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
        { replace: true },
      );
    },
    [navigate, direction, searchParams],
  );
  const [checksummedAddress, , ensError] = useAddressOrENS(
    addressOrName,
    urlFixer,
  );

  // Calculate txCount ONLY when asked for latest nonce
  const [txCount, setTxCount] = useState<bigint | undefined>();
  useEffect(() => {
    if (!checksummedAddress || rawNonce !== "latest") {
      setTxCount(undefined);
      return;
    }

    const readTxCount = async () => {
      const count = BigInt(
        await provider.getTransactionCount(checksummedAddress),
      );
      setTxCount(count);
    };
    readTxCount();
  }, [provider, checksummedAddress, rawNonce]);

  // Determine desired nonce from parse int query param or txCount - 1 nonce
  // in case of latest
  // TODO: Double check behavior
  let nonce: bigint | undefined | null;
  if (rawNonce === "latest") {
    if (txCount !== undefined) {
      nonce = txCount - 1n;
    }
  } else {
    nonce = BigInt(parseInt(rawNonce, 10));
    if (nonce < 0n) {
      nonce = null;
    }
  }

  // Given all base params are determined, get the corresponding tx
  const txHash = useTransactionBySenderAndNonce(
    provider,
    checksummedAddress,
    nonce !== undefined && nonce === null ? undefined : nonce,
  );

  // Success; replace and render filler
  useEffect(() => {
    if (txHash === undefined || txHash === null) {
      return;
    }

    startTransition(() => {
      navigate(transactionURL(txHash), { replace: true });
    });
  }, [txHash, navigate, startTransition]);

  // Invalid ENS
  if (ensError) {
    return (
      <StandardFrame>
        <AddressOrENSNameNotFound
          addressOrENSName={addressOrName}
          supportsENS={
            provider._network.getPlugin("org.ethers.plugins.network.Ens") !==
            null
          }
        />
      </StandardFrame>
    );
  }

  // Loading...
  if (checksummedAddress === undefined || nonce === undefined) {
    return <StandardFrame />;
  }

  // Address hasn't made the first outbound tx yet
  if (nonce !== null && nonce !== undefined && nonce < 0n) {
    return (
      <StandardFrame>
        <AddressOrENSNameNoTx addressOrENSName={checksummedAddress} />
      </StandardFrame>
    );
  }

  // Garbage nonce
  if (nonce === null) {
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

  return <StandardFrame />;
};

export default AddressTransactionByNonce;
