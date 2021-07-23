import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  useParams,
  useLocation,
  useHistory,
  Switch,
  Route,
} from "react-router-dom";
import { BlockTag } from "@ethersproject/abstract-provider";
import { getAddress, isAddress } from "@ethersproject/address";
import queryString from "query-string";
import Blockies from "react-blockies";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import Copy from "./components/Copy";
import ContentFrame from "./ContentFrame";
import TabGroup from "./components/TabGroup";
import Tab from "./components/Tab";
import Contract from "./address/Contract";
import UndefinedPageControl from "./search/UndefinedPageControl";
import ResultHeader from "./search/ResultHeader";
import PendingResults from "./search/PendingResults";
import TransactionItem from "./search/TransactionItem";
import { SearchController } from "./search/search";
import { RuntimeContext } from "./useRuntime";
import { useENSCache } from "./useReverseCache";
import { useFeeToggler } from "./search/useFeeToggler";
import { SelectionContext, useSelection } from "./useSelection";
import { useMultipleETHUSDOracle } from "./usePriceOracle";

type BlockParams = {
  addressOrName: string;
  direction?: string;
};

type PageParams = {
  p?: number;
};

const AddressTransactions: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams<BlockParams>();
  const location = useLocation<PageParams>();
  const history = useHistory();
  const qs = queryString.parse(location.search);
  let hash: string | undefined;
  if (qs.h) {
    hash = qs.h as string;
  }

  const [checksummedAddress, setChecksummedAddress] = useState<string>();
  const [isENS, setENS] = useState<boolean>();
  const [error, setError] = useState<boolean>();

  // If it looks like it is an ENS name, try to resolve it
  useEffect(() => {
    if (isAddress(params.addressOrName)) {
      setENS(false);
      setError(false);

      // Normalize to checksummed address
      const _checksummedAddress = getAddress(params.addressOrName);
      if (_checksummedAddress !== params.addressOrName) {
        // Request came with a non-checksummed address; fix the URL
        history.replace(
          `/address/${_checksummedAddress}${
            params.direction ? "/" + params.direction : ""
          }${location.search}`
        );
      }
      setChecksummedAddress(_checksummedAddress);
      return;
    }

    if (!provider) {
      return;
    }
    const resolveName = async () => {
      const resolvedAddress = await provider.resolveName(params.addressOrName);
      if (resolvedAddress !== null) {
        setENS(true);
        setError(false);
        setChecksummedAddress(resolvedAddress);
      } else {
        setENS(false);
        setError(true);
        setChecksummedAddress(undefined);
      }
    };
    resolveName();
  }, [
    provider,
    params.addressOrName,
    history,
    params.direction,
    location.search,
  ]);

  const [controller, setController] = useState<SearchController>();
  useEffect(() => {
    if (!provider || !checksummedAddress) {
      return;
    }

    const readFirstPage = async () => {
      const _controller = await SearchController.firstPage(
        provider,
        checksummedAddress
      );
      setController(_controller);
    };
    const readMiddlePage = async (next: boolean) => {
      const _controller = await SearchController.middlePage(
        provider,
        checksummedAddress,
        hash!,
        next
      );
      setController(_controller);
    };
    const readLastPage = async () => {
      const _controller = await SearchController.lastPage(
        provider,
        checksummedAddress
      );
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
    if (params.direction === "first" || params.direction === undefined) {
      if (!controller?.isFirst || controller.address !== checksummedAddress) {
        readFirstPage();
      }
    } else if (params.direction === "prev") {
      if (controller && controller.address === checksummedAddress) {
        prevPage();
      } else {
        readMiddlePage(false);
      }
    } else if (params.direction === "next") {
      if (controller && controller.address === checksummedAddress) {
        nextPage();
      } else {
        readMiddlePage(true);
      }
    } else if (params.direction === "last") {
      if (!controller?.isLast || controller.address !== checksummedAddress) {
        readLastPage();
      }
    }
  }, [provider, checksummedAddress, params.direction, hash, controller]);

  const page = useMemo(() => controller?.getPage(), [controller]);
  const reverseCache = useENSCache(provider, page);

  const blockTags: BlockTag[] = useMemo(() => {
    if (!page) {
      return [];
    }
    return page.map((p) => p.blockNumber);
  }, [page]);
  const priceMap = useMultipleETHUSDOracle(provider, blockTags);

  document.title = `Address ${params.addressOrName} | Otterscan`;

  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  const selectionCtx = useSelection();

  return (
    <StandardFrame>
      {error ? (
        <span className="text-base">
          "{params.addressOrName}" is not an ETH address or ENS name.
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
                    ENS: {params.addressOrName}
                  </span>
                )}
              </div>
            </StandardSubtitle>
            <TabGroup>
              <Tab href={`/address/${checksummedAddress}`}>Overview</Tab>
              <Tab href={`/address/${checksummedAddress}/contract`}>
                Contract
              </Tab>
            </TabGroup>
            <Switch>
              <Route path="/address/:addressOrName" exact>
                <ContentFrame tabs>
                  <div className="flex justify-between items-baseline py-3">
                    <div className="text-sm text-gray-500">
                      {page === undefined ? (
                        <>Waiting for search results...</>
                      ) : (
                        <>{page.length} transactions on this page</>
                      )}
                    </div>
                    <UndefinedPageControl
                      address={params.addressOrName}
                      isFirst={controller?.isFirst}
                      isLast={controller?.isLast}
                      prevHash={page ? page[0].hash : ""}
                      nextHash={page ? page[page.length - 1].hash : ""}
                      disabled={controller === undefined}
                    />
                  </div>
                  <ResultHeader
                    feeDisplay={feeDisplay}
                    feeDisplayToggler={feeDisplayToggler}
                  />
                  {controller ? (
                    <SelectionContext.Provider value={selectionCtx}>
                      {controller.getPage().map((tx) => (
                        <TransactionItem
                          key={tx.hash}
                          tx={tx}
                          ensCache={reverseCache}
                          selectedAddress={checksummedAddress}
                          feeDisplay={feeDisplay}
                          priceMap={priceMap}
                        />
                      ))}
                      <div className="flex justify-between items-baseline py-3">
                        <div className="text-sm text-gray-500">
                          {page === undefined ? (
                            <>Waiting for search results...</>
                          ) : (
                            <>{page.length} transactions on this page</>
                          )}
                        </div>
                        <UndefinedPageControl
                          address={params.addressOrName}
                          isFirst={controller?.isFirst}
                          isLast={controller?.isLast}
                          prevHash={page ? page[0].hash : ""}
                          nextHash={page ? page[page.length - 1].hash : ""}
                          disabled={controller === undefined}
                        />
                      </div>
                      <ResultHeader
                        feeDisplay={feeDisplay}
                        feeDisplayToggler={feeDisplayToggler}
                      />
                    </SelectionContext.Provider>
                  ) : (
                    <PendingResults />
                  )}
                </ContentFrame>
              </Route>
              <Route path="/address/:addressOrName/contract" exact>
                <Contract checksummedAddress={checksummedAddress} />
              </Route>
            </Switch>
          </>
        )
      )}
    </StandardFrame>
  );
};

export default React.memo(AddressTransactions);
