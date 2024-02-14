import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Disclosure } from "@headlessui/react";
import { JsonRpcApiProvider } from "ethers";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ContentFrame from "../../components/ContentFrame";
import { balancePreset } from "../../components/FiatValue";
import InfoRow from "../../components/InfoRow";
import NativeTokenAmountAndFiat from "../../components/NativeTokenAmountAndFiat";
import TransactionLink from "../../components/TransactionLink";
import { useProxyAttributes } from "../../ots2/usePrototypeTransferHooks";
import PendingResults from "../../search/PendingResults";
import ResultHeader from "../../search/ResultHeader";
import TransactionItem from "../../search/TransactionItem";
import UndefinedPageControl from "../../search/UndefinedPageControl";
import { SearchController } from "../../search/search";
import { useFeeToggler } from "../../search/useFeeToggler";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import { ChecksummedAddress, ProcessedTransaction } from "../../types";
import { BlockNumberContext } from "../../useBlockTagContext";
import { useChainInfo } from "../../useChainInfo";
import {
  useAddressBalance,
  useContractCreator,
  type ExtendedBlock,
} from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";
import { AddressAwareComponentProps } from "../types";
import BalanceGraph from "./BalanceGraph";
import PendingItem from "./PendingItem";

async function balanceAtBlock(
  provider: JsonRpcApiProvider,
  block: ExtendedBlock,
  address: ChecksummedAddress,
) {
  return provider.getBalance(address, block.number);
}

const AddressTransactionResults: FC<AddressAwareComponentProps> = ({
  address,
}) => {
  const { provider } = useContext(RuntimeContext);
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();
  const {
    nativeCurrency: { symbol: currencySymbol, decimals: currencyDecimals },
  } = useChainInfo();

  const { addressOrName, direction } = useParams();
  if (addressOrName === undefined) {
    throw new Error("addressOrName couldn't be undefined here");
  }

  usePageTitle(`Address ${addressOrName}`);

  const [searchParams] = useSearchParams();
  const hash = searchParams.get("h");

  const [controller, setController] = useState<SearchController>();
  useEffect(() => {
    if (!provider || !address) {
      return;
    }

    const readFirstPage = async () => {
      const _controller = await SearchController.firstPage(provider, address);
      setController(_controller);
    };
    const readMiddlePage = async (next: boolean) => {
      const _controller = await SearchController.middlePage(
        provider,
        address,
        hash!,
        next,
      );
      setController(_controller);
    };
    const readLastPage = async () => {
      const _controller = await SearchController.lastPage(provider, address);
      setController(_controller);
    };
    const prevPage = async () => {
      const _controller = await controller!.prevPage(provider, hash!);
      setController(_controller);
    };
    const nextPage = async () => {
      const _controller = await controller!.nextPage(provider, hash!);
      setController(_controller);
    };

    // Page load from scratch
    if (direction === "first" || direction === undefined) {
      if (!controller?.isFirst || controller.address !== address) {
        readFirstPage();
      }
    } else if (direction === "prev") {
      if (controller && controller.address === address) {
        prevPage();
      } else {
        readMiddlePage(false);
      }
    } else if (direction === "next") {
      if (controller && controller.address === address) {
        nextPage();
      } else {
        readMiddlePage(true);
      }
    } else if (direction === "last") {
      if (!controller?.isLast || controller.address !== address) {
        readLastPage();
      }
    }
  }, [provider, address, direction, hash, controller]);

  const page = useMemo(() => controller?.getPage(), [controller]);

  const balance = useAddressBalance(provider, address);
  const creator = useContractCreator(provider, address);
  const proxyAttributes = useProxyAttributes(provider, address);

  return (
    <ContentFrame tabs>
      <StandardSelectionBoundary>
        <BlockNumberContext.Provider value="latest">
          <InfoRow title="Balance">
            {balance !== null && balance !== undefined ? (
              <Disclosure>
                <div className="flex justify-between">
                  <NativeTokenAmountAndFiat
                    value={balance}
                    {...balancePreset}
                  />
                  <Disclosure.Button className="rounded border bg-skin-button-fill px-2 py-1 text-sm text-skin-button hover:bg-skin-button-hover-fill focus:outline-none">
                    <FontAwesomeIcon icon={faChartLine} />
                  </Disclosure.Button>
                </div>

                <Disclosure.Panel className="mt-2 max-w-4xl">
                  <BalanceGraph
                    balanceAtBlock={(provider, block) =>
                      balanceAtBlock(provider, block, address)
                    }
                    currencySymbol={currencySymbol}
                    currencyDecimals={currencyDecimals}
                  />
                </Disclosure.Panel>
              </Disclosure>
            ) : (
              <div className="w-80">
                <PendingItem />
              </div>
            )}
          </InfoRow>
          {creator && (
            <InfoRow title="Contract creator">
              <div className="flex flex-col md:flex-row divide-x-2 divide-dotted divide-gray-300">
                <TransactionAddressWithCopy
                  address={creator.creator}
                  showCodeIndicator
                />
                <div className="md:ml-3 flex items-baseline pl-3 truncate">
                  <div className="truncate">
                    <TransactionLink txHash={creator.hash} />
                  </div>
                </div>
              </div>
            </InfoRow>
          )}
          {proxyAttributes && proxyAttributes.proxyType && (
            <InfoRow title="Proxy type">{proxyAttributes.proxyType}</InfoRow>
          )}
          {proxyAttributes && proxyAttributes.logicAddress && (
            <InfoRow title="Logic contract">
              <DecoratedAddressLink address={proxyAttributes.logicAddress} />
            </InfoRow>
          )}
        </BlockNumberContext.Provider>
        <NavBar address={address} page={page} controller={controller} />
        <ResultHeader
          feeDisplay={feeDisplay}
          feeDisplayToggler={feeDisplayToggler}
        />
        {page ? (
          <>
            {page.map((tx) => (
              <TransactionItem
                key={tx.hash}
                tx={tx}
                selectedAddress={address}
                feeDisplay={feeDisplay}
              />
            ))}
            <NavBar address={address} page={page} controller={controller} />
          </>
        ) : (
          <PendingResults />
        )}
      </StandardSelectionBoundary>
    </ContentFrame>
  );
};

type NavBarProps = AddressAwareComponentProps & {
  page: ProcessedTransaction[] | undefined;
  controller: SearchController | undefined;
};

const NavBar: FC<NavBarProps> = ({ address, page, controller }) => (
  <div className="flex items-baseline justify-between py-3">
    <div className="text-sm text-gray-500">
      {page === undefined ? (
        <>Waiting for search results...</>
      ) : (
        <>
          <span data-test="page-count">{page.length}</span> transactions on this
          page
        </>
      )}
    </div>
    <UndefinedPageControl
      address={address}
      isFirst={controller?.isFirst}
      isLast={controller?.isLast}
      prevHash={page?.[0]?.hash ?? ""}
      nextHash={page?.[page.length - 1]?.hash ?? ""}
      disabled={controller === undefined}
    />
  </div>
);

export default AddressTransactionResults;
