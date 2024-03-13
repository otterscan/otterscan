import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import React, { useCallback, useContext } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import AddressOrENSNameNotFound from "../components/AddressOrENSNameNotFound";
import NavTab from "../components/NavTab";
import StandardFrame from "../components/StandardFrame";
import { useProxyAttributes } from "../ots2/usePrototypeTransferHooks";
import SourcifyLogo from "../sourcify/SourcifyLogo";
import { useSourcifyMetadata } from "../sourcify/useSourcify";
import { ChecksummedAddress } from "../types";
import { useHasCode } from "../useErigonHooks";
import { useAddressOrENS } from "../useResolvedAddresses";
import { RuntimeContext } from "../useRuntime";
import AddressERC20Results from "./address/AddressERC20Results";
import AddressERC721Results from "./address/AddressERC721Results";
import AddressSubtitle from "./address/AddressSubtitle";
import AddressTokens from "./address/AddressTokens";
import AddressTransactionResults from "./address/AddressTransactionResults";
import AddressWithdrawals from "./address/AddressWithdrawals";
import BlocksRewarded from "./address/BlocksRewarded";
import Contracts from "./address/Contracts";
import ReadContract from "./address/contract/ReadContract";
import { AddressAwareComponentProps } from "./types";

const ProxyTabs: React.FC<AddressAwareComponentProps> = ({ address }) => {
  const { addressOrName } = useParams();
  const { config, provider } = useContext(RuntimeContext);
  const proxyAttrs = useProxyAttributes(provider, address);
  return (
    <>
      {proxyAttrs.proxyHasCode && proxyAttrs.proxyMatch && (
        <NavTab href={`/address/${addressOrName}/proxyLogicContract`}>
          <span className={`flex items-baseline space-x-2`}>
            <span>Logic Contract</span>
            <SourcifyLogo />
          </span>
        </NavTab>
      )}
      {proxyAttrs.logicAddress && proxyAttrs.proxyMatch && (
        <NavTab href={`/address/${addressOrName}/readContractAsProxy`}>
          <span>Read as Proxy</span>
        </NavTab>
      )}
    </>
  );
};

const ProxyContracts: React.FC<AddressAwareComponentProps> = ({ address }) => {
  const { config, provider } = useContext(RuntimeContext);
  const proxyAttrs = useProxyAttributes(provider, address);
  return (
    <Contracts
      checksummedAddress={proxyAttrs.logicAddress!}
      match={proxyAttrs.proxyMatch}
    />
  );
};

const ProxyReadContract: React.FC<AddressAwareComponentProps> = ({
  address,
}) => {
  const { config, provider } = useContext(RuntimeContext);
  const proxyAttrs = useProxyAttributes(provider, address);
  return (
    <ReadContract checksummedAddress={address} match={proxyAttrs.proxyMatch} />
  );
};

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
        { replace: true },
      );
    },
    [navigate, direction, searchParams],
  );
  const [checksummedAddress, isENS, error] = useAddressOrENS(
    addressOrName,
    urlFixer,
  );

  const { config, provider } = useContext(RuntimeContext);
  const hasCode = useHasCode(provider, checksummedAddress);
  const match = useSourcifyMetadata(
    hasCode ? checksummedAddress : undefined,
    provider?._network.chainId,
  );

  return (
    <StandardFrame>
      {error ? (
        <AddressOrENSNameNotFound
          addressOrENSName={addressOrName}
          supportsENS={
            provider?._network.getPlugin("org.ethers.plugins.network.Ens") !==
            null
          }
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
                    <NavTab href={`/address/${addressOrName}/withdrawals`}>
                      Withdrawals
                    </NavTab>
                    <NavTab href={`/address/${addressOrName}/blocksRewarded`}>
                      Blocks Rewarded
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
                {hasCode && match && (
                  <NavTab href={`/address/${addressOrName}/readContract`}>
                    <span className={`flex items-baseline space-x-2`}>
                      <span>Read Contract</span>
                    </span>
                  </NavTab>
                )}
                {config?.experimental && (
                  <ProxyTabs address={checksummedAddress} />
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
                      <Route
                        path="withdrawals"
                        element={
                          <AddressWithdrawals address={checksummedAddress} />
                        }
                      />
                      <Route
                        path="blocksRewarded"
                        element={
                          <BlocksRewarded address={checksummedAddress} />
                        }
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
                  <Route
                    path="readContract"
                    element={
                      <ReadContract
                        checksummedAddress={checksummedAddress}
                        match={match}
                      />
                    }
                  />
                  {config?.experimental && (
                    <>
                      <Route
                        path="proxyLogicContract"
                        element={
                          <ProxyContracts address={checksummedAddress} />
                        }
                      />
                      <Route
                        path="readContractAsProxy"
                        element={
                          <ProxyReadContract address={checksummedAddress} />
                        }
                      />
                    </>
                  )}
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
