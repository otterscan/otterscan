import { FC, memo } from "react";
import ContentLoader from "react-content-loader";
import SlotLink from "../components/SlotLink";
import SlotTimestamp from "./SlotTimestamp";
import ValidatorLink from "../components/ValidatorLink";
import { slot2Epoch, useProposerMap } from "../../useConsensus";

type LoadingSlotItemProps = {
  slotNumber: number;
};

const LoadingSlotItem: FC<LoadingSlotItemProps> = ({ slotNumber }) => {
  const epochNumber = slot2Epoch(slotNumber);
  const proposers = useProposerMap(epochNumber);
  const expectedProposer = proposers && parseInt(proposers?.[slotNumber]);

  return (
    <div className="grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 hover:bg-skin-table-hover px-2 py-3">
      <SlotLink slotNumber={slotNumber} />
      <div>
        <ContentLoader viewBox="0 0 30 4">
          <rect x="0" y="0" rx="1" ry="1" width="30" height="4" />
        </ContentLoader>
      </div>
      <div className="truncate">
        <SlotTimestamp slotNumber={slotNumber} />
      </div>
      {expectedProposer !== undefined ? (
        <ValidatorLink validatorIndex={expectedProposer} />
      ) : (
        <div className="self-center">
          <ContentLoader viewBox="0 0 60 15" width={60} height={15}>
            <rect x="0" y="0" rx="3" ry="3" width="60" height="15" />
          </ContentLoader>
        </div>
      )}
    </div>
  );
};

export default memo(LoadingSlotItem);
