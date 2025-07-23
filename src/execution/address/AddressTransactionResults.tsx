import { useQuery } from "@tanstack/react-query";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
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
import {
  FeeDisplay,
  useToggler,
  ValueDisplay,
} from "../../search/useFeeToggler";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import { ProcessedTransaction } from "../../types";
import { BlockNumberContext } from "../../useBlockTagContext";
import {
  getBalanceQuery,
  useContractCreator,
  useTransactionCount,
} from "../../useErigonHooks";
import { useResolvedAddress } from "../../useResolvedAddresses";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import { commify } from "../../utils/utils";
import { type AddressOutletContext } from "../AddressMainPage";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";
import { AddressAwareComponentProps } from "../types";
import BlockNumberInput from "./BlockNumberInput";
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

const AddressTransactionResults: FC = () => {
  const { address, hasCode } = useOutletContext() as AddressOutletContext;
  const { config, provider } = useContext(RuntimeContext);
  const [feeDisplay, feeDisplayToggler] = useToggler(FeeDisplay);
  const [valueDisplay, valueDisplayToggler] = useToggler(ValueDisplay);

  const { addressOrName, direction } = useParams();
  if (addressOrName === undefined) {
    throw new Error("addressOrName couldn't be undefined here");
  }

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hash = searchParams.get("h");
  const blockNumber = searchParams.get("b");

  const [controller, setController] = useState<SearchController>();

  const transactionCount = useTransactionCount(
    provider,
    hasCode === false ? address : undefined,
  );

  useEffect(() => {
    if (!address) {
      return;
    }

    const readFirstPage = async () => {
      const _controller = await SearchController.firstPage(provider, address);
      setController(_controller);
    };
    const readMiddlePage = async (next: boolean) => {
      if (hash !== null) {
        const _controller = await SearchController.middlePage(
          provider,
          address,
          hash!,
          next,
        );
        setController(_controller);
      } else if (blockNumber !== null) {
        const _controller = await SearchController.middlePage(
          provider,
          address,
          null,
          next,
          Number(blockNumber),
        );
        setController(_controller);
      }
    };
    const readLastPage = async () => {
      const _controller = await SearchController.lastPage(provider, address);
      setController(_controller);
    };
    const prevPage = async () => {
      const _controller = await controller!.prevPage(provider, hash);
      setController(_controller);
    };
    const nextPage = async () => {
      const _controller = await controller!.nextPage(provider, hash);
      setController(_controller);
    };

    // Page load from scratch
    if (direction === "first" || direction === undefined) {
      if (!controller?.isFirst || controller.address !== address) {
        readFirstPage();
      }
    } else if (direction === "prev") {
      if (
        controller &&
        controller.address === address &&
        ((controller.startParams.pageType === "prev" &&
          controller.startParams.tx !== null &&
          controller.startParams.tx === hash) ||
          controller.isAdjacentPage(hash, "prev") ||
          controller.startParams.blockNumber === Number(blockNumber))
      ) {
        prevPage();
      } else {
        readMiddlePage(false);
      }
    } else if (direction === "next") {
      if (
        controller &&
        controller.address === address &&
        ((controller.startParams.pageType === "next" &&
          controller.startParams.tx !== null &&
          controller.startParams.tx === hash) ||
          controller.isAdjacentPage(hash, "next") ||
          controller.startParams.blockNumber === Number(blockNumber))
      ) {
        nextPage();
      } else {
        readMiddlePage(true);
      }
    } else if (direction === "last") {
      if (!controller?.isLast || controller.address !== address) {
        readLastPage();
      }
    }
  }, [provider, address, direction, hash, controller, blockNumber]);

  const page = useMemo(() => controller?.getPage(), [controller]);

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

  const { data: balance } = useQuery(getBalanceQuery(provider, address));

  async function onBlockNumberEntry(blockNumberStr: string) {
    navigate(`/address/${address}/txs/${"next"}?b=${blockNumberStr}`);
  }

  return (
    <ContentFrame tabs>
      <StandardSelectionBoundary>
        <BlockNumberContext.Provider value="latest">
          <InfoRow title="Balance">
            <div className="grid grid-cols-3 flex md:divide-x-2 divide-dotted divide-gray-300 text-sm">
              <div
                className={`${transactionCount !== undefined ? "col-span-3 md:col-span-1" : "col-span-3"}`}
              >
                {balance === undefined ? (
                  <div className="w-80">
                    <PendingItem />
                  </div>
                ) : (
                  <NativeTokenAmountAndFiat
                    value={balance}
                    {...balancePreset}
                  />
                )}
              </div>
              {transactionCount !== undefined && (
                <div className="hidden md:visible pl-4 col-span-2 md:grid grid-cols-2">
                  <div className="col-span-1">Transactions sent:</div>
                  <div className="col-span-1">
                    {commify(transactionCount.toString())}
                  </div>
                </div>
              )}
            </div>
          </InfoRow>
          {transactionCount !== undefined && (
            <div className="md:hidden">
              <InfoRow title="Transactions sent">
                {commify(transactionCount.toString())}
              </InfoRow>
            </div>
          )}
          {creator && (
            <InfoRow title="Contract creator">
              <div className="flex flex-col md:flex-row divide-x-2 divide-dotted divide-gray-300">
                <div className="pr-3">
                  <TransactionAddressWithCopy
                    address={creator.creator}
                    showCodeIndicator
                  />
                </div>
                <div className="md:ml-3 flex items-baseline truncate">
                  <div className="truncate">
                    <TransactionLink txHash={creator.hash} />
                  </div>
                </div>
              </div>
            </InfoRow>
          )}
          {config.experimental && <ProxyInfo address={address} />}
        </BlockNumberContext.Provider>
        <NavBar
          address={address}
          page={page}
          controller={controller}
          onBlockNumberEntry={onBlockNumberEntry}
        />
        <StandardScrollableTable isAuto={true}>
          <ResultHeader
            feeDisplay={feeDisplay}
            feeDisplayToggler={feeDisplayToggler}
            valueDisplay={valueDisplay}
            valueDisplayToggler={valueDisplayToggler}
          />
          {page ? (
            <StandardTBody>
              {page.map((tx) => (
                <TransactionItem
                  key={tx.hash}
                  tx={tx}
                  selectedAddress={address}
                  feeDisplay={feeDisplay}
                  valueDisplay={valueDisplay}
                />
              ))}
            </StandardTBody>
          ) : (
            <PendingPage rows={1} cols={8} />
          )}
        </StandardScrollableTable>
        <NavBar
          address={address}
          page={page}
          controller={controller}
          onBlockNumberEntry={onBlockNumberEntry}
        />
      </StandardSelectionBoundary>
    </ContentFrame>
  );
};

type NavBarProps = AddressAwareComponentProps & {
  page: ProcessedTransaction[] | undefined;
  controller: SearchController | undefined;
  onBlockNumberEntry: (blockNumber: string) => void;
};

const NavBar: FC<NavBarProps> = ({
  address,
  page,
  controller,
  onBlockNumberEntry,
}) => (
  <div className="flex items-baseline justify-between py-3">
    <div className="text-sm text-gray-500">
      {page === undefined ? (
        <>Waiting for search results...</>
      ) : (
        <>
          <span data-test="page-count">{page.length}</span> transaction
          {page.length !== 1 && "s"} on this page
        </>
      )}
    </div>
    <div className="flex space-x-8">
      <div className="flex items-center">
        <BlockNumberInput
          onSearch={onBlockNumberEntry}
          placeholder="Jump to block number"
        />
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
  </div>
);

export default AddressTransactionResults;
