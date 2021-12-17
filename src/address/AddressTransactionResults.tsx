import React, { useContext, useEffect, useMemo, useState } from "react";
import { BlockTag } from "@ethersproject/providers";
import ContentFrame from "../ContentFrame";
import PendingResults from "../search/PendingResults";
import ResultHeader from "../search/ResultHeader";
import { SearchController } from "../search/search";
import TransactionItem from "../search/TransactionItem";
import UndefinedPageControl from "../search/UndefinedPageControl";
import { useFeeToggler } from "../search/useFeeToggler";
import { SelectionContext, useSelection } from "../useSelection";
import { useMultipleETHUSDOracle } from "../usePriceOracle";
import { RuntimeContext } from "../useRuntime";
import { pageCollector, useResolvedAddresses } from "../useResolvedAddresses";
import { useParams, useSearchParams } from "react-router-dom";
import { ChecksummedAddress } from "../types";
import { useContractsMetadata } from "../hooks";

type AddressTransactionResultsProps = {
  address: ChecksummedAddress;
};

const AddressTransactionResults: React.FC<AddressTransactionResultsProps> = ({
  address,
}) => {
  const { provider } = useContext(RuntimeContext);
  const selectionCtx = useSelection();
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  const { addressOrName, direction } = useParams();
  if (addressOrName === undefined) {
    throw new Error("addressOrName couldn't be undefined here");
  }

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
        next
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

  // Extract block number from all txs on current page
  // TODO: dedup blockTags
  const blockTags: BlockTag[] = useMemo(() => {
    if (!page) {
      return [];
    }
    return page.map((t) => t.blockNumber);
  }, [page]);
  const priceMap = useMultipleETHUSDOracle(provider, blockTags);

  // Resolve all addresses that appear on this page results
  const addrCollector = useMemo(() => pageCollector(page), [page]);

  // Calculate Sourcify metadata for all addresses that appear on this page results
  const addresses = useMemo(() => {
    const _addresses = [address];
    if (page) {
      for (const t of page) {
        if (t.to) {
          _addresses.push(t.to);
        }
        if (t.createdContractAddress) {
          _addresses.push(t.createdContractAddress);
        }
      }
    }
    return _addresses;
  }, [address, page]);
  const metadatas = useContractsMetadata(addresses, provider);

  return (
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
          address={address}
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
      {page ? (
        <SelectionContext.Provider value={selectionCtx}>
          {page.map((tx) => (
            <TransactionItem
              key={tx.hash}
              tx={tx}
              selectedAddress={address}
              feeDisplay={feeDisplay}
              priceMap={priceMap}
              metadatas={metadatas}
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
              address={address}
              isFirst={controller?.isFirst}
              isLast={controller?.isLast}
              prevHash={page ? page[0].hash : ""}
              nextHash={page ? page[page.length - 1].hash : ""}
              disabled={controller === undefined}
            />
          </div>
        </SelectionContext.Provider>
      ) : (
        <PendingResults />
      )}
    </ContentFrame>
  );
};

export default AddressTransactionResults;
