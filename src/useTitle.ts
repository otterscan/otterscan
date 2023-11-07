import { BlockTag, isHexString } from "ethers";
import { useContext } from "react";
import { RuntimeContext } from "./useRuntime";
import { commify } from "./utils/utils";

/**
 * Set the page title.
 */
export const usePageTitle = (title: string | undefined) => {
  const { config } = useContext(RuntimeContext);
  if (title === undefined) {
    return;
  }
  const siteName = config?.branding?.siteName || "Otterscan";
  const networkTitle = config?.branding?.networkTitle
    ? `| ${config?.branding?.networkTitle} `
    : "";
  document.title = `${title} ${networkTitle}| ${siteName}`;
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
  usePageTitle(
    blockNumber === undefined
      ? undefined
      : `Block #${commify(blockNumber)} Txns | Page ${pageNumber}${
          pageCount === undefined ? "" : "/" + pageCount
        }`,
  );
};
