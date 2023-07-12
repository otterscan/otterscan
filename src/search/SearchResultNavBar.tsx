import { FC, ReactNode, memo } from "react";
import PageControl from "./PageControl";

type SearchResultNavBarProps = {
  /**
   * 1-based page number.
   * 
   * If omitted, assumes 1 using default value.
   */
  pageNumber?: number;

  /**
   * The max number of elements inside a page result. Used to calculate
   * how many pages exist in navigation controls.
   *
   * If undefined, it doesn't display the page navigation controls.
   */
  pageSize?: number | undefined;

  /**
   * The total number of results in the scope of the search.
   *
   * Undefined means the total is not still available (getting from the server).
   */
  total: number | undefined;

  /**
   * Callback used to format the text displayed inside this component given
   * a formatted total.
   */
  totalFormatter: (total: number) => ReactNode;
};

const SearchResultNavBar: FC<SearchResultNavBarProps> = ({
  pageNumber = 1,
  pageSize,
  total,
  totalFormatter,
}) => (
  <div className="flex items-baseline justify-between py-3">
    <div className="text-sm text-gray-500">
      {total === undefined
        ? "Waiting for search results..."
        : totalFormatter(total)}
    </div>
    {pageSize !== undefined && total !== undefined && (
      <PageControl pageNumber={pageNumber} pageSize={pageSize} total={total} />
    )}
  </div>
);

export default memo(SearchResultNavBar);
