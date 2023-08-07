import React, { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import StandardFrame from "../components/StandardFrame";
import { PAGE_SIZE } from "../params";
import { RuntimeContext } from "../useRuntime";
import StandardSubtitle from "../components/StandardSubtitle";
import { useLatestBlockHeader } from "../useLatestBlock";
import { useRecentBlocks } from "../useErigonHooks";
import BlockItem from "../search/BlockItem";
import PendingBlockResults from "../search/PendingBlockResults";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import { useFeeToggler } from "../search/useFeeToggler";
import ContentFrame from "../components/ContentFrame";
import BlockResultHeader from "../search/BlockResultHeader";
import { totalBlocksFormatter } from "../search/messages";
import SearchResultNavBar from "../search/SearchResultNavBar";

const BlockList: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  
  const latestBlock = useLatestBlockHeader(provider);

  const [feeDisplay, feeDisplayToggler] = useFeeToggler();
  const latestBlockNum = latestBlock?.number;
  

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
        <div className="flex items-baseline space-x-1">Block List</div>
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
        />
        {data ? (
            <StandardSelectionBoundary>
            {data.map((block) => (
                block ? <BlockItem key={block.number} block={block} feeDisplay={feeDisplay} /> : <></> 
            ))}
            </StandardSelectionBoundary>
        ) : (
            <PendingBlockResults />
        )}
    </ContentFrame>
    </StandardFrame>
  );
};

export default BlockList;
