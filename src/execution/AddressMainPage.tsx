import React, { useEffect, useCallback, useContext } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Tab } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import StandardFrame from "../components/StandardFrame";
import AddressSubtitle from "./address/AddressSubtitle";
import AddressOrENSNameNotFound from "../components/AddressOrENSNameNotFound";
import NavTab from "../components/NavTab";
import SourcifyLogo from "../sourcify/SourcifyLogo";
import AddressTransactionResults from "./address/AddressTransactionResults";
import AddressERC20Results from "./address/AddressERC20Results";
import AddressERC721Results from "./address/AddressERC721Results";
import AddressTokens from "./address/AddressTokens";
import Contracts from "./address/Contracts";
import { RuntimeContext } from "../useRuntime";
import { useHasCode } from "../useErigonHooks";
import { useAddressOrENS } from "../useResolvedAddresses";
import { useSourcifyMetadata } from "../sourcify/useSourcify";
import { ChecksummedAddress } from "../types";

type AddressMainPageProps = {};

const AddressMainPage: React.FC<AddressMainPageProps> = () => {
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
  const hasCode = useHasCode(provider, checksummedAddress);
  const match = useSourcifyMetadata(
    hasCode ? checksummedAddress : undefined,
    provider?.network.chainId
  );

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
            <AddressSubtitle
              addressOrName={addressOrName}
              address={checksummedAddress}
              isENS={isENS}
            />
            <Tab.Group>
              <Tab.List className="flex space-x-2 rounded-t-lg border-l border-r border-t bg-white">
                <NavTab href={`/address/${addressOrName}`}>Overview</NavTab>
                {config?.experimental && (
                  <>
                    <NavTab href={`/address/${addressOrName}/erc20`}>
                      ERC20 Transfers
                    </NavTab>
                    <NavTab href={`/address/${addressOrName}/erc721`}>
                      ERC721 Transfers
                    </NavTab>
                    <NavTab href={`/address/${addressOrName}/tokens`}>
                      Token Balances
                    </NavTab>
                  </>
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
                    <>
                      <Route
                        path="erc20"
                        element={
                          <AddressERC20Results address={checksummedAddress} />
                        }
                      />
                      <Route
                        path="erc721"
                        element={
                          <AddressERC721Results address={checksummedAddress} />
                        }
                      />
                      <Route
                        path="tokens"
                        element={<AddressTokens address={checksummedAddress} />}
                      />
                    </>
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
