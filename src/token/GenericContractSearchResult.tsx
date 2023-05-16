import { FC, ReactNode } from "react";
import { commify } from "@ethersproject/units";
import StandardFrame from "../components/StandardFrame";
import StandardSubtitle from "../components/StandardSubtitle";
import ContentFrame from "../components/ContentFrame";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import StandardScrollableTable from "../components/StandardScrollableTable";
import StandardTHead from "../components/StandardTHead";
import StandardTBody from "../components/StandardTBody";
import PageControl from "../search/PageControl";
import { ContractMatch } from "../ots2/usePrototypeHooks";

type GenericContractSearchResultProps<T> = {
  /**
   * Title describing the contract search, i.e., "ERC20 tokens".
   */
  title: string;

  /**
   * A control to be inserted into results's table header control;
   * usually a fragment containing a series of <th>'s.
   *
   * The <th>'s may have a column width.
   */
  header: ReactNode;

  /**
   * 1-based page number.
   */
  pageNumber: number;

  /**
   * The max number of elements inside a page result. Used to calculate
   * how many pages exist in navigation controls.
   */
  pageSize: number;

  /**
   * The total number of results in the scope of the search, i.e.,
   * for an ERC20 search, it should represent the total number of
   * existing ERC20 contracts so far.
   */
  total: number | undefined;

  /**
   * Represents 1 page of search results. The entire page will be rendered
   * by this component.
   */
  page: T[] | undefined;

  /**
   * Renders 1 page result. It should be a fragment with the result <td> columns.
   */
  Item: FC<T>;
};

const GenericContractSearchResult = <T extends ContractMatch>({
  title,
  header,
  pageNumber,
  pageSize,
  total,
  page,
  Item,
}: GenericContractSearchResultProps<T>) => (
  <StandardFrame>
    <StandardSubtitle>
      <div className="flex items-baseline space-x-1">
        <span>{title}</span>
      </div>
    </StandardSubtitle>
    <ContentFrame key={pageNumber}>
      <div className="flex items-baseline justify-between py-3">
        <div className="text-sm text-gray-500">
          {page === undefined || total === undefined ? (
            <>Waiting for search results...</>
          ) : (
            <>A total of {commify(total)} contracts found</>
          )}
        </div>
        {total !== undefined && (
          <PageControl
            pageNumber={pageNumber}
            pageSize={pageSize}
            total={total}
          />
        )}
      </div>
      <StandardScrollableTable>
        <StandardTHead>{header}</StandardTHead>
        {page !== undefined ? (
          <StandardSelectionBoundary>
            <StandardTBody>
              {page.map((m) => (
                <tr key={m.address}>
                  <Item {...m} />
                </tr>
              ))}
            </StandardTBody>
          </StandardSelectionBoundary>
        ) : (
          // <PendingResults />
          <></>
        )}
      </StandardScrollableTable>
      {page !== undefined && total !== undefined && (
        <div className="flex items-baseline justify-between py-3">
          <div className="text-sm text-gray-500">
            A total of {commify(total)} contracts found
          </div>
          <PageControl
            pageNumber={pageNumber}
            pageSize={pageSize}
            total={total}
          />
        </div>
      )}
    </ContentFrame>
  </StandardFrame>
);

export default GenericContractSearchResult;
