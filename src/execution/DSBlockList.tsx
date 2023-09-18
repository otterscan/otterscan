import React, { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import StandardFrame from "../components/StandardFrame";
import { PAGE_SIZE } from "../params";
import { RuntimeContext } from "../useRuntime";
import StandardSubtitle from "../components/StandardSubtitle";
import { useLatestBlockChainInfo } from "../useLatestBlock";
import { PendingRecentDSBlockResults } from "../search/PendingResults";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import ContentFrame from "../components/ContentFrame";
import { totalBlocksFormatter } from "../search/messages";
import SearchResultNavBar from "../search/SearchResultNavBar";
import { useDSBlocksData } from "../useZilliqaHooks";
import RecentDSBlockItem from "../search/RecentDSBlockItem";
import DSBlockResultHeader from "../search/DSBlockResultHeader";
import DSBlockItem from "../search/DSBlockItem";

const DSBlockList: React.FC = () => {
  const { zilliqa } = useContext(RuntimeContext);
  
  const latestBlockChainInfo = useLatestBlockChainInfo(zilliqa); 
  const latestBlockNum = latestBlockChainInfo?.CurrentDSEpoch;
  const latestBlockNumInt = latestBlockNum !== undefined ? parseInt(latestBlockNum, 10) : undefined;

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const { data, isLoading } = useDSBlocksData(
    zilliqa,
    latestBlockNumInt,
    pageNumber - 1,
    PAGE_SIZE
  );

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex items-baseline space-x-1">DS Block List</div>
      </StandardSubtitle>
      <ContentFrame isLoading={isLoading}>
      <SearchResultNavBar
        pageNumber={pageNumber}
        pageSize={PAGE_SIZE}
        total={latestBlockNumInt}
        totalFormatter={totalBlocksFormatter}
      />
      <DSBlockResultHeader/>
      {data ? (
        <StandardSelectionBoundary>
          {data.map((block) => (
            block ? <DSBlockItem key={block.header.BlockNum} block={block} /> : <></> 
          ))}
        </StandardSelectionBoundary>
      ) : (
        <PendingRecentDSBlockResults />
      )}
    </ContentFrame>
    </StandardFrame>
  );
};

export default DSBlockList;
