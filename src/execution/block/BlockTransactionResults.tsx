import React from "react";
import { commify } from "@ethersproject/units";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import SearchResultNavBar from "../address/SearchResultNavBar";
import ResultHeader from "../../search/ResultHeader";
import PendingResults from "../../search/PendingResults";
import TransactionItem from "../../search/TransactionItem";
import { useFeeToggler } from "../../search/useFeeToggler";
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
        totalFormatter={totalFormatter}
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
            totalFormatter={totalFormatter}
          />
        </StandardSelectionBoundary>
      ) : (
        <PendingResults />
      )}
    </ContentFrame>
  );
};

const totalFormatter = (total: number) =>
  `A total of ${commify(total)} ${
    total > 1 ? "transactions" : "transaction"
  } found`;

export default React.memo(BlockTransactionResults);
