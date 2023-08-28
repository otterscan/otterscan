import { useEffect } from "react";
import { commify } from "./utils/utils";

/**
 * Title for main block page.
 */
export const useBlockPageTitle = (blockNumber: number) => {
  useEffect(() => {
    document.title = `Block #${commify(blockNumber)} | Otterscan`;
  }, [blockNumber]);
};

/**
 * Page title for 1 page of transactions results for a block.
 */
export const useBlockTransactionsPageTitle = (
  blockNumber: number,
  pageNumber: number,
  pageCount: number | undefined
) => {
  useEffect(() => {
    if (blockNumber !== undefined) {
      document.title = `Block #${commify(
        blockNumber
      )} Txns | Page ${pageNumber}${
        pageCount === undefined ? "" : "/" + pageCount
      } | Otterscan`;
    }
  }, [blockNumber]);
};
