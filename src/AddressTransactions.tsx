import React, { useState, useEffect, useContext } from "react";
import {
  useParams,
  useNavigate,
  Routes,
  Route,
  useSearchParams,
} from "react-router-dom";
import { getAddress, isAddress } from "@ethersproject/address";
import { Tab } from "@headlessui/react";
import Blockies from "react-blockies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons/faQuestionCircle";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import Copy from "./components/Copy";
import NavTab from "./components/NavTab";
import SourcifyLogo from "./sourcify/SourcifyLogo";
import AddressTransactionResults from "./address/AddressTransactionResults";
import Contracts from "./address/Contracts";
import { RuntimeContext } from "./useRuntime";
import { useAppConfigContext } from "./useAppConfig";
import { useSingleMetadata } from "./sourcify/useSourcify";

const AddressTransactions: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const { addressOrName, direction } = useParams();
  if (addressOrName === undefined) {
    throw new Error("addressOrName couldn't be undefined here");
  }

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [checksummedAddress, setChecksummedAddress] = useState<
    string | undefined
  >();
  const [isENS, setENS] = useState<boolean>();
  const [error, setError] = useState<boolean>();

  // If it looks like it is an ENS name, try to resolve it
  useEffect(() => {
    // TODO: handle and offer fallback to bad checksummed addresses
    if (isAddress(addressOrName)) {
      setENS(false);
      setError(false);

      // Normalize to checksummed address
      const _checksummedAddress = getAddress(addressOrName);
      if (_checksummedAddress !== addressOrName) {
        // Request came with a non-checksummed address; fix the URL
        navigate(
          `/address/${_checksummedAddress}${
            direction ? "/" + direction : ""
          }?${searchParams.toString()}`,
          { replace: true }
        );
        return;
      }

      setChecksummedAddress(_checksummedAddress);
      document.title = `Address ${_checksummedAddress} | Otterscan`;
      return;
    }

    if (!provider) {
      return;
    }
    const resolveName = async () => {
      const resolvedAddress = await provider.resolveName(addressOrName);
      if (resolvedAddress !== null) {
        setENS(true);
        setError(false);
        setChecksummedAddress(resolvedAddress);
        document.title = `Address ${addressOrName} | Otterscan`;
      } else {
        setENS(false);
        setError(true);
        setChecksummedAddress(undefined);
      }
    };
    resolveName();
  }, [provider, addressOrName, navigate, direction, searchParams]);

  const { sourcifySource } = useAppConfigContext();
  const addressMetadata = useSingleMetadata(
    checksummedAddress,
    provider?.network.chainId,
    sourcifySource
  );

  return (
    <StandardFrame>
      {error ? (
        <span className="text-base">
          "{addressOrName}" is not an ETH address or ENS name.
        </span>
      ) : (
        checksummedAddress && (
          <>
            <StandardSubtitle>
              <div className="flex space-x-2 items-baseline">
                <Blockies
                  className="self-center rounded"
                  seed={checksummedAddress.toLowerCase()}
                  scale={3}
                />
                <span>Address</span>
                <span className="font-address text-base text-gray-500">
                  {checksummedAddress}
                </span>
                <Copy value={checksummedAddress} rounded />
                {isENS && (
                  <span className="rounded-lg px-2 py-1 bg-gray-200 text-gray-500 text-xs">
                    ENS: {addressOrName}
                  </span>
                )}
              </div>
            </StandardSubtitle>
            <Tab.Group>
              <Tab.List className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
                <NavTab href={`/address/${checksummedAddress}`}>
                  Overview
                </NavTab>
                <NavTab href={`/address/${checksummedAddress}/contract`}>
                  <span
                    className={`flex items-baseline space-x-2 ${
                      addressMetadata === undefined ? "italic opacity-50" : ""
                    }`}
                  >
                    <span>Contract</span>
                    {addressMetadata === undefined ? (
                      <span className="self-center">
                        <FontAwesomeIcon
                          className="animate-spin"
                          icon={faCircleNotch}
                        />
                      </span>
                    ) : addressMetadata === null ? (
                      <span className="self-center text-red-500">
                        <FontAwesomeIcon icon={faQuestionCircle} />
                      </span>
                    ) : (
                      <span className="self-center">
                        <SourcifyLogo />
                      </span>
                    )}
                  </span>
                </NavTab>
              </Tab.List>
              <Tab.Panels>
                <Routes>
                  <Route
                    path="*"
                    element={
                      <AddressTransactionResults address={checksummedAddress} />
                    }
                  />
                  <Route
                    path="contract"
                    element={
                      <Contracts
                        checksummedAddress={checksummedAddress}
                        rawMetadata={addressMetadata}
                      />
                    }
                  />
                </Routes>
              </Tab.Panels>
            </Tab.Group>
          </>
        )
      )}
    </StandardFrame>
  );
};

export default AddressTransactions;
