import { BlockTag, isHexString } from "ethers";
import { useContext } from "react";
import { RuntimeContext } from "./useRuntime";
import { commify } from "./utils/utils";

/**
 * Set the page title.
 */
export const usePageTitle = (title: string | undefined) => {
  if (title === undefined) {
    return;
  }
  const { config } = useContext(RuntimeContext);
  const siteName = config?.branding?.siteName || "Otterscan";
  document.title = `${title} | ${siteName}`;
};

/**
 * Title for main block page.
 */
export const useBlockPageTitle = (blockNumber: BlockTag) => {
  let blockStr = blockNumber;
  if (!isHexString(blockNumber)) {
    blockStr = `#${commify(blockNumber)}`;
  }
  usePageTitle(`Block ${blockStr}`);
};

/**
 * Page title for 1 page of transactions results for a block.
 */
export const useBlockTransactionsPageTitle = (
  blockNumber: number,
  pageNumber: number,
  pageCount: number | undefined,
) => {
  if (blockNumber !== undefined) {
    usePageTitle(
      `Block #${commify(blockNumber)} Txns | Page ${pageNumber}${
        pageCount === undefined ? "" : "/" + pageCount
      }`,
    );
  }
};
