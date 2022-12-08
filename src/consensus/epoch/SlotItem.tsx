import { FC, memo } from "react";
import LoadingSlotItem from "./LoadingSlotItem";
import NotFoundSlotItem from "./NotFoundSlotItem";
import StoredSlotItem from "./StoredSlotItem";
import { useSlot } from "../../useConsensus";

type SlotItemProps = {
  slotNumber: number;
};

const SlotItem: FC<SlotItemProps> = ({ slotNumber }) => {
  const {
    slot,
    error: slotError,
    isLoading: slotIsLoading,
  } = useSlot(slotNumber);

  if (slotIsLoading) {
    return <LoadingSlotItem slotNumber={slotNumber} />;
  }
  if (slotError) {
    return <NotFoundSlotItem slotNumber={slotNumber} />;
  }

  return <StoredSlotItem slotNumber={slotNumber} slot={slot} />;
};

export default memo(SlotItem);
