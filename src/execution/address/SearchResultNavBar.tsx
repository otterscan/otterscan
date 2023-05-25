import { FC, memo } from "react";
import { commify } from "@ethersproject/units";
import PageControl from "../../search/PageControl";

type SearchResultNavBarProps = {
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
   * The total number of results in the scope of the search.
   *
   * Undefined means the total is not still available (getting from the server).
   */
  total: number | undefined;
};

const SearchResultNavBar: FC<SearchResultNavBarProps> = ({
  pageNumber,
  pageSize,
  total,
}) => (
  <div className="flex items-baseline justify-between py-3">
    <div className="text-sm text-gray-500">
      {total === undefined ? (
        <>Waiting for search results...</>
      ) : (
        <>
          A total of {commify(total)}{" "}
          {total > 1 ? "transactions" : "transaction"} found
        </>
      )}
    </div>
    {total !== undefined && (
      <PageControl pageNumber={pageNumber} pageSize={pageSize} total={total} />
    )}
  </div>
);

export default memo(SearchResultNavBar);
