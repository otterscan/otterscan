import { FC, memo } from "react";
import LoadingSlotItem from "./LoadingSlotItem";
import NotFoundSlotItem from "./NotFoundSlotItem";
import StoredSlotItem from "./StoredSlotItem";
import { useSlot } from "../../useConsensus";

type SlotItemProps = {
  slotNumber: number;
};

const SlotItem: FC<SlotItemProps> = ({ slotNumber }) => {
  const { error, isLoading } = useSlot(slotNumber);

  if (isLoading) {
    return <LoadingSlotItem slotNumber={slotNumber} />;
  }
  if (error) {
    return <NotFoundSlotItem slotNumber={slotNumber} />;
  }

  return <StoredSlotItem slotNumber={slotNumber} />;
};

export default memo(SlotItem);
