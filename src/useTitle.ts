import { useEffect } from "react";
import { BlockTag, isHexString } from "ethers";
import { commify } from "./utils/utils";

/**
 * Title for main block page.
 */
export const useBlockPageTitle = (blockNumber: BlockTag) => {
  let blockStr = blockNumber;
  if (!isHexString(blockNumber)) {
    blockStr = `#${commify(blockNumber)}`;
  }
  useEffect(() => {
    document.title = `Block ${blockStr} | Otterscan`;
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
