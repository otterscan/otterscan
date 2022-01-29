import React, { useCallback, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import StandardFrame from "./StandardFrame";
import AddressOrENSNameNotFound from "./components/AddressOrENSNameNotFound";
import { ChecksummedAddress } from "./types";
import { transactionURL } from "./url";
import { useTransactionBySenderAndNonce } from "./useErigonHooks";
import { useAddressOrENS } from "./useResolvedAddresses";
import { RuntimeContext } from "./useRuntime";

const AddressTransaction: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const navigate = useNavigate();
  const { addressOrName } = useParams();
  if (addressOrName === undefined) {
    throw new Error("addressOrName couldn't be undefined here");
  }

  const [searchParams] = useSearchParams();
  const urlFixer = useCallback(
    (address: ChecksummedAddress) => {
      navigate(`/address/${address}/tx?${searchParams.toString()}`, {
        replace: true,
      });
    },
    [navigate, searchParams]
  );
  const [checksummedAddress, isENS, error] = useAddressOrENS(
    addressOrName,
    urlFixer
  );

  const rawNonce = searchParams.get("nonce");
  if (rawNonce === null) {
    throw new Error("rawNonce couldn't be undefined here");
  }
  let nonce: number | undefined = undefined;
  try {
    nonce = parseInt(rawNonce);
  } catch (err) {
    // ignore
  }

  const txHash = useTransactionBySenderAndNonce(
    provider,
    checksummedAddress,
    nonce
  );

  if (error) {
    return <AddressOrENSNameNotFound addressOrENSName={addressOrName} />;
  }
  if (txHash) {
    navigate(transactionURL(txHash));
  }
  return <StandardFrame />;
};

export default AddressTransaction;
