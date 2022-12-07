import { FC, memo } from "react";
import SuspendedSlotItem from "./SuspendedSlotItem";
import NotFoundSlotItem from "./NotFoundSlotItem";
import StoredSlotItem from "./StoredSlotItem";
import { useFinalizedSlotNumber, useSlot } from "../../useConsensus";

type SlotItemProps = {
  slotNumber: number;
};

const SlotItem: FC<SlotItemProps> = ({ slotNumber }) => {
  const finalizedSlotNumber = useFinalizedSlotNumber();
  const {
    slot,
    error: slotError,
    isLoading: slotIsLoading,
  } = useSlot(slotNumber);

  if (slotIsLoading) {
    return <SuspendedSlotItem slotNumber={slotNumber} />;
  }
  if (slotError) {
    if (finalizedSlotNumber !== undefined && slotNumber > finalizedSlotNumber) {
      return <NotFoundSlotItem slotNumber={slotNumber} scheduled />;
    }
    return <NotFoundSlotItem slotNumber={slotNumber} missed />;
  }

  return <StoredSlotItem slotNumber={slotNumber} slot={slot} />;
};

export default memo(SlotItem);
