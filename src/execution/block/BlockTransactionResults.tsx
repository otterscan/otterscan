import React from "react";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import SearchResultNavBar from "../../search/SearchResultNavBar";
import ResultHeader from "../../search/ResultHeader";
import PendingResults from "../../search/PendingResults";
import TransactionItem from "../../search/TransactionItem";
import { useFeeToggler } from "../../search/useFeeToggler";
import { totalTransactionsFormatter } from "../../search/messages";
import { ProcessedTransaction } from "../../types";
import { PAGE_SIZE } from "../../params";

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
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  return (
    <ContentFrame>
      <SearchResultNavBar
        pageNumber={pageNumber}
        pageSize={PAGE_SIZE}
        total={total}
        totalFormatter={totalTransactionsFormatter}
      />
      <ResultHeader
        feeDisplay={feeDisplay}
        feeDisplayToggler={feeDisplayToggler}
      />
      {page ? (
        <StandardSelectionBoundary>
          {page.map((tx) => (
            <TransactionItem key={tx.hash} tx={tx} feeDisplay={feeDisplay} />
          ))}
          <SearchResultNavBar
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
            totalFormatter={totalTransactionsFormatter}
          />
        </StandardSelectionBoundary>
      ) : (
        <PendingResults />
      )}
    </ContentFrame>
  );
};

export default React.memo(BlockTransactionResults);
