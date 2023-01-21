import React, { useEffect, useCallback, useContext } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Tab } from "@headlessui/react";
import Blockies from "react-blockies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import AddressOrENSNameNotFound from "./components/AddressOrENSNameNotFound";
import Copy from "./components/Copy";
import Faucet from "./components/Faucet";
import NavTab from "./components/NavTab";
import SourcifyLogo from "./sourcify/SourcifyLogo";
import AddressTransactionResults from "./address/AddressTransactionResults";
import AddressTokens from "./address/AddressTokens";
import Contracts from "./address/Contracts";
import { RuntimeContext } from "./useRuntime";
import { useHasCode } from "./useErigonHooks";
import { useChainInfo } from "./useChainInfo";
import { useAddressOrENS } from "./useResolvedAddresses";
import { useSourcifyMetadata } from "./sourcify/useSourcify";
import { ChecksummedAddress } from "./types";

type AddressMainPageProps = {};

const AddressMainPage: React.FC<AddressMainPageProps> = ({}) => {
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
  const [checksummedAddress, isENS, error] = useAddressOrENS(
    addressOrName,
    urlFixer
  );

  const { config, provider } = useContext(RuntimeContext);
  const hasCode = useHasCode(provider, checksummedAddress, "latest");
  const match = useSourcifyMetadata(
    hasCode ? checksummedAddress : undefined,
    provider?.network.chainId
  );

  const { network, faucets } = useChainInfo();

  useEffect(() => {
    if (isENS || checksummedAddress === undefined) {
      document.title = `Address ${addressOrName} | Otterscan`;
    } else {
      document.title = `Address ${checksummedAddress} | Otterscan`;
    }
  }, [addressOrName, checksummedAddress, isENS]);

  return (
    <StandardFrame>
      {error ? (
        <AddressOrENSNameNotFound
          addressOrENSName={addressOrName}
          supportsENS={provider?.network.ensAddress !== undefined}
        />
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
                {/* Only display faucets for testnets who actually have any */}
                {network === "testnet" && faucets && faucets.length > 0 && (
                  <Faucet address={checksummedAddress} rounded />
                )}
                {isENS && (
                  <span className="rounded-lg px-2 py-1 bg-gray-200 text-gray-500 text-xs">
                    ENS: {addressOrName}
                  </span>
                )}
              </div>
            </StandardSubtitle>
            <Tab.Group>
              <Tab.List className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
                <NavTab href={`/address/${addressOrName}`}>Overview</NavTab>
                {config?.experimental && (
                  <NavTab href={`/address/${addressOrName}/tokens`}>
                    Tokens
                  </NavTab>
                )}
                {hasCode && (
                  <NavTab href={`/address/${addressOrName}/contract`}>
                    <span
                      className={`flex items-baseline space-x-2 ${
                        match === undefined ? "italic opacity-50" : ""
                      }`}
                    >
                      <span>Contract</span>
                      {match === undefined ? (
                        <span className="self-center">
                          <FontAwesomeIcon
                            className="animate-spin"
                            icon={faCircleNotch}
                          />
                        </span>
                      ) : match === null ? (
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
                )}
              </Tab.List>
              <Tab.Panels>
                <Routes>
                  <Route
                    index
                    element={
                      <AddressTransactionResults address={checksummedAddress} />
                    }
                  />
                  <Route
                    path="txs/:direction"
                    element={
                      <AddressTransactionResults address={checksummedAddress} />
                    }
                  />
                  {config?.experimental && (
                    <Route
                      path="tokens"
                      element={<AddressTokens address={checksummedAddress} />}
                    />
                  )}
                  <Route
                    path="contract"
                    element={
                      <Contracts
                        checksummedAddress={checksummedAddress}
                        match={match}
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

export default AddressMainPage;
