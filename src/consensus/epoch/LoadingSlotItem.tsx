import { FC, memo } from "react";
import ContentLoader from "react-content-loader";
import { useProposerMap, useSlotToEpoch } from "../../useConsensus";
import CheckedValidatorLink from "../components/CheckedValidatorLink";
import SlotLink from "../components/SlotLink";
import { SlotAwareComponentProps } from "../types";
import SlotTimestamp from "./SlotTimestamp";

const LoadingSlotItem: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const epochNumber = useSlotToEpoch(slotNumber);
  const proposers = useProposerMap(epochNumber);
  const expectedProposer =
    proposers &&
    (slotNumber in proposers ? parseInt(proposers?.[slotNumber]) : undefined);

  return (
    <tr>
      <td>
        <SlotLink slot={slotNumber} scheduled />
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
