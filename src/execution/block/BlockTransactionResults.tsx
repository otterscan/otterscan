import { FC, memo } from "react";
import ContentFrame from "../../components/ContentFrame";
import StandardScrollableTable from "../../components/StandardScrollableTable";
import StandardTBody from "../../components/StandardTBody";
import { PAGE_SIZE } from "../../params";
import ResultHeader from "../../search/ResultHeader";
import SearchResultNavBar from "../../search/SearchResultNavBar";
import TransactionItem from "../../search/TransactionItem";
import { totalTransactionsFormatter } from "../../search/messages";
import { useFeeToggler } from "../../search/useFeeToggler";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import { ProcessedTransaction } from "../../types";
import PendingPage from "../address/PendingPage";

type BlockTransactionResultsProps = {
  page?: ProcessedTransaction[];
  total: number;
  pageNumber: number;
  isLoading: boolean;
};

const BlockTransactionResults: FC<BlockTransactionResultsProps> = ({
  page,
  total,
  pageNumber,
  isLoading,
}) => {
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  return (
    <ContentFrame isLoading={isLoading}>
      <SearchResultNavBar
        pageNumber={pageNumber}
        pageSize={PAGE_SIZE}
        total={total}
        totalFormatter={totalTransactionsFormatter}
      />
      <StandardScrollableTable isAuto={true}>
        <ResultHeader
          feeDisplay={feeDisplay}
          feeDisplayToggler={feeDisplayToggler}
        />
        {page ? (
          <StandardSelectionBoundary>
            <StandardTBody>
              {page.map((tx) => (
                <TransactionItem
                  key={tx.hash}
                  tx={tx}
                  feeDisplay={feeDisplay}
                />
              ))}
            </StandardTBody>
          </StandardSelectionBoundary>
        ) : (
          <PendingPage rows={1} cols={8} />
        )}
      </StandardScrollableTable>
      {page && (
        <SearchResultNavBar
          pageNumber={pageNumber}
          pageSize={PAGE_SIZE}
          total={total}
          totalFormatter={totalTransactionsFormatter}
        />
      )}
    </ContentFrame>
  );
};

export default memo(BlockTransactionResults);
