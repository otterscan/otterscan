import { FC, memo } from "react";
import { SlotAwareComponentProps } from "../types";
import ScheduledOrMissedSlotItem from "./ScheduledOrMissedSlotItem";
import { useFinalizedSlotNumber } from "../../useConsensus";

type NotFoundSlotItemProps = SlotAwareComponentProps & {
  isValidating: boolean;
};

const NotFoundSlotItem: FC<NotFoundSlotItemProps> = ({
  slotNumber,
  isValidating,
}) => {
  const finalizedSlotNumber = useFinalizedSlotNumber();
  if (finalizedSlotNumber === undefined || slotNumber > finalizedSlotNumber) {
    return (
      <ScheduledOrMissedSlotItem
        slotNumber={slotNumber}
        isValidating={isValidating}
        scheduled
      />
    );
  }
  return (
    <ScheduledOrMissedSlotItem
      slotNumber={slotNumber}
      isValidating={isValidating}
      missed
    />
  );
};

export default memo(NotFoundSlotItem);
