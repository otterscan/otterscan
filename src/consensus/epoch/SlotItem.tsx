import { FC, memo } from "react";
import LoadingSlotItem from "./LoadingSlotItem";
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
    return <LoadingSlotItem slotNumber={slotNumber} />;
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
