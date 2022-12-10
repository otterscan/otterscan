import { FC, memo } from "react";
import ScheduledOrMissedSlotItem from "./ScheduledOrMissedSlotItem";
import { useFinalizedSlotNumber } from "../../useConsensus";

type NotFoundSlotItemProps = {
  slotNumber: number;
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
