import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ContentFrame from "../../components/ContentFrame";
import { balancePreset } from "../../components/FiatValue";
import InfoRow from "../../components/InfoRow";
import NativeTokenAmountAndFiat from "../../components/NativeTokenAmountAndFiat";
import StandardScrollableTable from "../../components/StandardScrollableTable";
import StandardTBody from "../../components/StandardTBody";
import TransactionLink from "../../components/TransactionLink";
import { useProxyAttributes } from "../../ots2/usePrototypeTransferHooks";
import ResultHeader from "../../search/ResultHeader";
import TransactionItem from "../../search/TransactionItem";
import UndefinedPageControl from "../../search/UndefinedPageControl";
import { SearchController } from "../../search/search";
import { useFeeToggler } from "../../search/useFeeToggler";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import { ProcessedTransaction } from "../../types";
import { BlockNumberContext } from "../../useBlockTagContext";
import {
  useAddressBalance,
  useContractCreator,
  useHasCode,
  useTransactionCount,
} from "../../useErigonHooks";
import { useResolvedAddress } from "../../useResolvedAddresses";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";
import { AddressAwareComponentProps } from "../types";
import PendingItem from "./PendingItem";
import PendingPage from "./PendingPage";

const ProxyInfo: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);
  const proxyAttributes = useProxyAttributes(provider, address);
  return (
    <>
      {proxyAttributes && proxyAttributes.proxyType && (
        <InfoRow title="Proxy type">{proxyAttributes.proxyType}</InfoRow>
      )}
      {proxyAttributes && proxyAttributes.logicAddress && (
        <InfoRow title="Logic contract">
          <DecoratedAddressLink address={proxyAttributes.logicAddress} />
        </InfoRow>
      )}
    </>
  );
};

const AddressTransactionResults: FC<AddressAwareComponentProps> = ({
  address,
}) => {
  const { config, provider } = useContext(RuntimeContext);
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  const { addressOrName, direction } = useParams();
  if (addressOrName === undefined) {
    throw new Error("addressOrName couldn't be undefined here");
  }

  const [searchParams] = useSearchParams();
  const hash = searchParams.get("h");

  const [controller, setController] = useState<SearchController>();

  const hasCode = useHasCode(provider, address);
  const transactionCount = useTransactionCount(
    provider,
    hasCode === false ? address : undefined,
  );

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
  const resolvedAddress = useResolvedAddress(provider, address);
  const resolvedName = resolvedAddress
    ? resolvedAddress[0].resolveToString(resolvedAddress[1])
    : undefined;
  const resolvedNameTrusted = resolvedAddress
    ? resolvedAddress[0].trusted(resolvedAddress[1])
    : undefined;

  usePageTitle(
    resolvedName && resolvedNameTrusted
      ? `${resolvedName} | Address ${addressOrName}`
      : `Address ${addressOrName}`,
  );

  return (
    <ContentFrame tabs>
      <StandardSelectionBoundary>
        <BlockNumberContext.Provider value="latest">
          <InfoRow title="Balance">
            <div className="grid grid-cols-3 flex divide-x-2 divide-dotted divide-gray-300 text-sm">
              <div
                className={`${transactionCount !== undefined ? "col-span-1" : ""}`}
              >
                {balance !== null && balance !== undefined ? (
                  <NativeTokenAmountAndFiat
                    value={balance}
                    {...balancePreset}
                  />
                ) : (
                  <div className="w-80">
                    <PendingItem />
                  </div>
                )}
              </div>
              {transactionCount !== undefined && (
                <div className="pl-4 col-span-2 grid grid-cols-2">
                  <div className="col-span-1">Transactions sent:</div>
                  <div className="col-span-1">
                    {transactionCount.toString()}
                  </div>
                </div>
              )}
            </div>
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
          {config && config.experimental && <ProxyInfo address={address} />}
        </BlockNumberContext.Provider>
        <NavBar address={address} page={page} controller={controller} />
        <StandardScrollableTable isAuto={true}>
          <ResultHeader
            feeDisplay={feeDisplay}
            feeDisplayToggler={feeDisplayToggler}
          />
          {page ? (
            <StandardTBody>
              {page.map((tx) => (
                <TransactionItem
                  key={tx.hash}
                  tx={tx}
                  selectedAddress={address}
                  feeDisplay={feeDisplay}
                />
              ))}
            </StandardTBody>
          ) : (
            <PendingPage rows={1} cols={8} />
          )}
        </StandardScrollableTable>
        <NavBar address={address} page={page} controller={controller} />
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
