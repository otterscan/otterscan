import { FC } from "react";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import StandardTable from "../../components/StandardTable";
import StandardTHead from "../../components/StandardTHead";
import StandardTBody from "../../components/StandardTBody";
import SearchResultNavBar from "../../search/SearchResultNavBar";
import PendingPage from "./PendingPage";
import { TransactionMatch } from "../../ots2/usePrototypeTransferHooks";
import { totalTransactionsFormatter } from "../../search/messages";
import { PAGE_SIZE } from "../../params";

type GenericTransactionSearchResultProps<T> = {
  /**
   * 1-based page number.
   */
  pageNumber: number;

  /**
   * The total number of results in the scope of the search.
   */
  total: number | undefined;

  /**
   * Represents 1 page of search results. The entire page will be rendered
   * by this component.
   */
  items: T[] | undefined;

  /**
   * Renders 1 page result. It should be a fragment with the result <td> columns.
   */
  Item: FC<T>;
};

const GenericTransactionSearchResult = <T extends TransactionMatch>({
  pageNumber,
  total,
  items,
  Item,
}: GenericTransactionSearchResultProps<T>) => (
  <ContentFrame key={pageNumber} tabs>
    {total === 0 ? (
      <div className="py-3 text-sm text-gray-500">No transactions found</div>
    ) : (
      <>
        <SearchResultNavBar
          pageNumber={pageNumber}
          pageSize={PAGE_SIZE}
          total={total}
          totalFormatter={totalTransactionsFormatter}
        />
        <StandardTable>
          <StandardTHead>
            <th className="w-56">Txn Hash</th>
            <th className="w-28">Method</th>
            <th className="w-28">Block</th>
            <th className="w-28">Age</th>
            <th>From</th>
            <th>To</th>
            <th className="w-44">Value</th>
          </StandardTHead>
          {items !== undefined ? (
            <StandardSelectionBoundary>
              <StandardTBody>
                {items.map((i) => (
                  <Item key={i.hash} {...i} />
                ))}
              </StandardTBody>
            </StandardSelectionBoundary>
          ) : (
            <PendingPage rows={PAGE_SIZE} cols={7} />
          )}
        </StandardTable>
        {total !== undefined && (
          <SearchResultNavBar
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
            totalFormatter={totalTransactionsFormatter}
          />
        )}
      </>
    )}
  </ContentFrame>
);

export default GenericTransactionSearchResult;
