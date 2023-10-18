import { FC } from "react";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import StandardTable from "../../components/StandardTable";
import StandardTHead from "../../components/StandardTHead";
import StandardTBody from "../../components/StandardTBody";
import SearchResultNavBar from "../../search/SearchResultNavBar";
import PendingPage from "./PendingPage";
import { TransactionMatch } from "../../ots2/usePrototypeTransferHooks";
import { getTotalFormatter } from "../../search/messages";
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

  /**
   * Table header; customize for pseudotransactions
   */
  header?: JSX.Element;

  /**
   * Name of the transaction type, e.g. 'transaction' or 'withdrawal'
   */
  typeName?: string;

  /**
   * Number of columns to fill when results are pending
   */
  columns?: number;
};

const defaultHeader = (
  <StandardTHead>
    <th className="w-56">Txn Hash</th>
    <th className="w-28">Method</th>
    <th className="w-28">Block</th>
    <th className="w-28">Age</th>
    <th>From</th>
    <th>To</th>
    <th className="w-44">Value</th>
  </StandardTHead>
);

const GenericTransactionSearchResult = <T extends { hash: string }>({
  pageNumber,
  total,
  items,
  Item,
  header = defaultHeader,
  typeName = "transaction",
  columns = 7,
}: GenericTransactionSearchResultProps<T>) => {
  const totalFormatter = getTotalFormatter(typeName);
  return (
    <ContentFrame key={pageNumber} tabs>
      {total === 0 ? (
        <div className="py-3 text-sm text-gray-500">No {typeName}s found</div>
      ) : (
        <>
          <SearchResultNavBar
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
            totalFormatter={totalFormatter}
          />
          <StandardTable>
            {header}
            {items !== undefined ? (
              <StandardSelectionBoundary>
                <StandardTBody>
                  {items.map((i) => (
                    <Item key={i.hash} {...i} />
                  ))}
                </StandardTBody>
              </StandardSelectionBoundary>
            ) : (
              <PendingPage rows={PAGE_SIZE} cols={columns} />
            )}
          </StandardTable>
          {total !== undefined && (
            <SearchResultNavBar
              pageNumber={pageNumber}
              pageSize={PAGE_SIZE}
              total={total}
              totalFormatter={totalFormatter}
            />
          )}
        </>
      )}
    </ContentFrame>
  );
};

export default GenericTransactionSearchResult;
