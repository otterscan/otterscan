import React, { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import StandardFrame from "../components/StandardFrame";
import { PAGE_SIZE } from "../params";
import { RuntimeContext } from "../useRuntime";
import StandardSubtitle from "../components/StandardSubtitle";
import { useLatestBlockNumber } from "../useLatestBlock";
import { useRecentBlocks } from "../useErigonHooks";
import BlockItem from "../search/BlockItem";
import { PendingBlockResults } from "../search/PendingResults";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import { useFeeToggler } from "../search/useFeeToggler";
import { EmptyBlocksDisplay, useEmptyBlocksToggler } from "../search/useEmptyBlocksToggler";
import ContentFrame from "../components/ContentFrame";
import BlockResultHeader from "../search/BlockResultHeader";
import { totalBlocksFormatter } from "../search/messages";
import SearchResultNavBar from "../search/SearchResultNavBar";

const BlockList: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  
  const latestBlockNum = useLatestBlockNumber(provider);
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();
  const [emptyBlocksDisplay, emptyBlocksDisplayToggler] = useEmptyBlocksToggler();
  

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const { data, isLoading } = useRecentBlocks(
    provider,
    latestBlockNum,
    pageNumber - 1,
    PAGE_SIZE
  );

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex items-baseline space-x-1">Tx Block List</div>
      </StandardSubtitle>
      <ContentFrame isLoading={isLoading}>
      <SearchResultNavBar
        pageNumber={pageNumber}
        pageSize={PAGE_SIZE}
        total={latestBlockNum}
        totalFormatter={totalBlocksFormatter}
      />
        <BlockResultHeader
            feeDisplay={feeDisplay}
            feeDisplayToggler={feeDisplayToggler}
            emptyBlocksDisplay={emptyBlocksDisplay}
    emptyBlocksDisplayToggler={emptyBlocksDisplayToggler}
        />
        {data ? (
            <StandardSelectionBoundary>
            {data.map((block) => (
              (block &&
                ( emptyBlocksDisplay === EmptyBlocksDisplay.SHOW_EMPTY_BLOCKS ||
                  block.transactionCount != 0) ) ? <BlockItem key={block.number} block={block} feeDisplay={feeDisplay} /> : undefined 
            )).filter((blk) => blk !== undefined)}
            </StandardSelectionBoundary>
        ) : (
            <PendingBlockResults />
        )}
    </ContentFrame>
    </StandardFrame>
  );
};

export default BlockList;
