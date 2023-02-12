import { FC, memo } from "react";
import ContentLoader from "react-content-loader";
import { SlotAwareComponentProps } from "../types";
import SlotLink from "../components/SlotLink";
import SlotTimestamp from "./SlotTimestamp";
import CheckedValidatorLink from "../components/CheckedValidatorLink";
import { slot2Epoch, useProposerMap } from "../../useConsensus";

const LoadingSlotItem: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const epochNumber = slot2Epoch(slotNumber);
  const proposers = useProposerMap(epochNumber);
  const expectedProposer = proposers && parseInt(proposers?.[slotNumber]);

  return (
    <tr>
      <td>
        <SlotLink slotNumber={slotNumber} scheduled />
      </td>
      <td>
        <ContentLoader viewBox="0 0 30 4">
          <rect x="0" y="0" rx="1" ry="1" width="30" height="4" />
        </ContentLoader>
      </td>
      <td></td>
      <td>
        <SlotTimestamp slotNumber={slotNumber} />
      </td>
      {expectedProposer !== undefined ? (
        <td>
          <CheckedValidatorLink validatorIndex={expectedProposer} />
        </td>
      ) : (
        <td className="self-center">
          <ContentLoader viewBox="0 0 60 15" width={60} height={15}>
            <rect x="0" y="0" rx="3" ry="3" width="60" height="15" />
          </ContentLoader>
        </td>
      )}
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  );
};

export default memo(LoadingSlotItem);
