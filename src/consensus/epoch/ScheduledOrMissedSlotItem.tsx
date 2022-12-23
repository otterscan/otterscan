import { FC, memo } from "react";
import ContentLoader from "react-content-loader";
import { SlotAwareComponentProps } from "../types";
import SlotLink from "../components/SlotLink";
import SlotTimestamp from "./SlotTimestamp";
import ValidatorLink from "../components/ValidatorLink";
import { slot2Epoch, useProposerMap } from "../../useConsensus";

type ScheduledOrMissedSlotItemProps = SlotAwareComponentProps & {
  missed?: boolean;
  scheduled?: boolean;
  isValidating: boolean;
};

const ScheduledOrMissedSlotItem: FC<ScheduledOrMissedSlotItemProps> = ({
  slotNumber,
  missed,
  scheduled,
  isValidating,
}) => {
  const epochNumber = slot2Epoch(slotNumber);
  const proposers = useProposerMap(epochNumber);
  const expectedProposer = proposers && parseInt(proposers?.[slotNumber]);

  return (
    <tr>
      <td>
        <SlotLink
          slotNumber={slotNumber}
          missed={missed}
          scheduled={scheduled}
        />
      </td>
      <td className={`${isValidating ? "italic text-gray-400" : ""}`}>
        {missed && "Missed"}
        {scheduled && "Scheduled"}
      </td>
      <td>-</td>
      <td>
        <SlotTimestamp slotNumber={slotNumber} />
      </td>
      {expectedProposer !== undefined ? (
        <td>
          <ValidatorLink validatorIndex={expectedProposer} />
        </td>
      ) : (
        <td className="self-center">
          <ContentLoader viewBox="0 0 60 15" width={60} height={15}>
            <rect x="0" y="0" rx="3" ry="3" width="60" height="15" />
          </ContentLoader>
        </td>
      )}
      <td>-</td>
      <td>-</td>
      <td></td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>
  );
};

export default memo(ScheduledOrMissedSlotItem);
