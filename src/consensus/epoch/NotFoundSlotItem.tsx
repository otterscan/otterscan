import { FC, memo } from "react";
import ScheduledOrMissedSlotItem from "./ScheduledOrMissedSlotItem";
import { useFinalizedSlotNumber } from "../../useConsensus";

type NotFoundSlotItemProps = {
  slotNumber: number;
};

const NotFoundSlotItem: FC<NotFoundSlotItemProps> = ({ slotNumber }) => {
  const finalizedSlotNumber = useFinalizedSlotNumber();
  if (finalizedSlotNumber === undefined || slotNumber > finalizedSlotNumber) {
    return <ScheduledOrMissedSlotItem slotNumber={slotNumber} scheduled />;
  }
  return <ScheduledOrMissedSlotItem slotNumber={slotNumber} missed />;
};

export default memo(NotFoundSlotItem);
