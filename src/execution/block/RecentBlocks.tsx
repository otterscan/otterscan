import { FC, useContext, memo } from "react";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import { useFeeToggler } from "../../search/useFeeToggler";
import { RuntimeContext } from "../../useRuntime";
import { useRecentBlocks } from "../../useErigonHooks";
import { useLatestBlockHeader } from "../../useLatestBlock";
import { RECENT_SIZE } from "../../params";
import RecentBlockItem from "../../search/RecentBlockItem";
import RecentBlockResultHeader from "../../search/RecentBlockResultHeader";
import PendingBlockResults from "../../search/PendingBlockResults";
import RecentNavBar from "../../search/RecentNavBar";


const RecentBlocks: FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  const latestBlock = useLatestBlockHeader(provider);
  const latestBlockNum = latestBlock?.number;

  // Uses hook to get the most recent blocks
  const { data, isLoading } = useRecentBlocks(
    provider,
    latestBlockNum,
    0,
    RECENT_SIZE
  );

  // Return a table with rows containing the basic information of the most recent RECENT_SIZE blocks
  return (
    <ContentFrame isLoading={isLoading}>
      <RecentNavBar isLoading={ data === undefined }/>
      <RecentBlockResultHeader
        feeDisplay={feeDisplay}
        feeDisplayToggler={feeDisplayToggler}
      />
      {data ? (
        <StandardSelectionBoundary>
          {data.map((block) => (
            block ? <RecentBlockItem key={block.number} block={block} feeDisplay={feeDisplay} /> : <></> 
          ))}
        </StandardSelectionBoundary>
      ) : (
        <PendingBlockResults />
      )}
    </ContentFrame>
  );
};

export default memo(RecentBlocks);
