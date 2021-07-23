import React, { useContext } from "react";
import ContentFrame from "../ContentFrame";
import PageControl from "../search/PageControl";
import ResultHeader from "../search/ResultHeader";
import PendingResults from "../search/PendingResults";
import TransactionItem from "../search/TransactionItem";
import { useFeeToggler } from "../search/useFeeToggler";
import { RuntimeContext } from "../useRuntime";
import { SelectionContext, useSelection } from "../useSelection";
import { useENSCache } from "../useReverseCache";
import { ProcessedTransaction } from "../types";
import { PAGE_SIZE } from "../params";

type BlockTransactionResultsProps = {
  page?: ProcessedTransaction[];
  total: number;
  pageNumber: number;
};

const BlockTransactionResults: React.FC<BlockTransactionResultsProps> = ({
  page,
  total,
  pageNumber,
}) => {
  const selectionCtx = useSelection();
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();
  const { provider } = useContext(RuntimeContext);
  const reverseCache = useENSCache(provider, page);

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
              ensCache={reverseCache}
              feeDisplay={feeDisplay}
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
