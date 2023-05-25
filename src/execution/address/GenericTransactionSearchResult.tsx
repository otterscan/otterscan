import { FC } from "react";
import { commify } from "@ethersproject/units";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import StandardTable from "../../components/StandardTable";
import StandardTHead from "../../components/StandardTHead";
import StandardTBody from "../../components/StandardTBody";
import PageControl from "../../search/PageControl";
import PendingPage from "./PendingPage";
import { TransactionMatch } from "../../ots2/usePrototypeTransferHooks";
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
        <div className="flex items-baseline justify-between py-3">
          <div className="text-sm text-gray-500">
            {items === undefined || total === undefined ? (
              <>Waiting for search results...</>
            ) : (
              <>
                A total of {commify(total)}{" "}
                {total > 1 ? "transactions" : "transaction"} found
              </>
            )}
          </div>
          {total !== undefined && (
            <PageControl
              pageNumber={pageNumber}
              pageSize={PAGE_SIZE}
              total={total}
            />
          )}
        </div>
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
        {items !== undefined && total !== undefined && (
          <div className="flex items-baseline justify-between py-3">
            <div className="text-sm text-gray-500">
              A total of {commify(total)}{" "}
              {total > 1 ? "transactions" : "transaction"} found
            </div>
            <PageControl
              pageNumber={pageNumber}
              pageSize={PAGE_SIZE}
              total={total}
            />
          </div>
        )}
      </>
    )}
  </ContentFrame>
);

export default GenericTransactionSearchResult;
