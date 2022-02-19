import React, { useContext, useEffect, useMemo, useState } from "react";
import { BlockTag } from "@ethersproject/providers";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import FormattedBalance from "../components/FormattedBalance";
import TransactionAddress from "../components/TransactionAddress";
import Copy from "../components/Copy";
import TransactionLink from "../components/TransactionLink";
import PendingResults from "../search/PendingResults";
import ResultHeader from "../search/ResultHeader";
import { SearchController } from "../search/search";
import TransactionItem from "../search/TransactionItem";
import UndefinedPageControl from "../search/UndefinedPageControl";
import { useFeeToggler } from "../search/useFeeToggler";
import { SelectionContext, useSelection } from "../useSelection";
import { useMultipleETHUSDOracle } from "../usePriceOracle";
import { RuntimeContext } from "../useRuntime";
import { useParams, useSearchParams } from "react-router-dom";
import { ChecksummedAddress, ProcessedTransaction } from "../types";
import { useContractsMetadata } from "../hooks";
import { useAddressBalance, useContractCreator } from "../useErigonHooks";

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
  const balance = useAddressBalance(provider, address);
  const creator = useContractCreator(provider, address);

  return (
    <ContentFrame tabs>
      <SelectionContext.Provider value={selectionCtx}>
        {balance && (
          <InfoRow title="Balance">
            <FormattedBalance value={balance} /> Ether{" "}
          </InfoRow>
        )}
        {creator && (
          <InfoRow title="Contract creator">
            <div className="flex items-baseline space-x-2 -ml-1">
              <TransactionAddress address={creator.creator} />
              <Copy value={creator.creator} />
              <span className="text-gray-400 text-xs">at</span>
              <span>tx:</span>
              <TransactionLink txHash={creator.hash} />
            </div>
          </InfoRow>
        )}
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
                priceMap={priceMap}
                metadatas={metadatas}
              />
            ))}
            <NavBar address={address} page={page} controller={controller} />
          </>
        ) : (
          <PendingResults />
        )}
      </SelectionContext.Provider>
    </ContentFrame>
  );
};

type NavBarProps = {
  address: ChecksummedAddress;
  page: ProcessedTransaction[] | undefined;
  controller: SearchController | undefined;
};

const NavBar: React.FC<NavBarProps> = ({ address, page, controller }) => (
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
      prevHash={page?.[0]?.hash ?? ""}
      nextHash={page?.[page.length - 1]?.hash ?? ""}
      disabled={controller === undefined}
    />
  </div>
);

export default AddressTransactionResults;
