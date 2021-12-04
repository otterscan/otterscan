import React, { useContext, useMemo } from "react";
import { BlockTag } from "@ethersproject/abstract-provider";
import ContentFrame from "../ContentFrame";
import PageControl from "../search/PageControl";
import ResultHeader from "../search/ResultHeader";
import PendingResults from "../search/PendingResults";
import TransactionItem from "../search/TransactionItem";
import { useFeeToggler } from "../search/useFeeToggler";
import { RuntimeContext } from "../useRuntime";
import { SelectionContext, useSelection } from "../useSelection";
import { pageCollector, useResolvedAddresses } from "../useResolvedAddresses";
import { ChecksummedAddress, ProcessedTransaction } from "../types";
import { PAGE_SIZE } from "../params";
import { useMultipleETHUSDOracle } from "../usePriceOracle";
import { useContractsMetadata } from "../hooks";

type BlockTransactionResultsProps = {
  blockTag: BlockTag;
  page?: ProcessedTransaction[];
  total: number;
  pageNumber: number;
};

const BlockTransactionResults: React.FC<BlockTransactionResultsProps> = ({
  blockTag,
  page,
  total,
  pageNumber,
}) => {
  const { provider } = useContext(RuntimeContext);
  const selectionCtx = useSelection();
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();
  const addrCollector = useMemo(() => pageCollector(page), [page]);
  const resolvedAddresses = useResolvedAddresses(provider, addrCollector);
  const blockTags = useMemo(() => [blockTag], [blockTag]);
  const priceMap = useMultipleETHUSDOracle(provider, blockTags);

  const addresses = useMemo((): ChecksummedAddress[] => {
    if (!page) {
      return [];
    }

    const _addresses: ChecksummedAddress[] = [];
    for (const t of page) {
      if (t.to) {
        _addresses.push(t.to);
      }
      if (t.createdContractAddress) {
        _addresses.push(t.createdContractAddress);
      }
    }
    return _addresses;
  }, [page]);
  const metadatas = useContractsMetadata(addresses, provider);

  return (
    <ContentFrame>
      <div className="flex justify-between items-baseline py-3">
        <div className="text-sm text-gray-500">
          {page === undefined ? (
            <>Waiting for search results...</>
          ) : (
            <>A total of {total} transactions found</>
          )}
        </div>
        <PageControl
          pageNumber={pageNumber}
          pageSize={PAGE_SIZE}
          total={total}
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
              resolvedAddresses={resolvedAddresses}
              feeDisplay={feeDisplay}
              priceMap={priceMap}
              metadatas={metadatas}
            />
          ))}
          <div className="flex justify-between items-baseline py-3">
            <div className="text-sm text-gray-500">
              A total of {total} transactions found
            </div>
            <PageControl
              pageNumber={pageNumber}
              pageSize={PAGE_SIZE}
              total={total}
            />
          </div>
        </SelectionContext.Provider>
      ) : (
        <PendingResults />
      )}
    </ContentFrame>
  );
};

export default React.memo(BlockTransactionResults);
