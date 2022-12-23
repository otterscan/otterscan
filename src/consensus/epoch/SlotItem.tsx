import { FC, memo } from "react";
import { SlotAwareComponentProps } from "../types";
import LoadingSlotItem from "./LoadingSlotItem";
import NotFoundSlotItem from "./NotFoundSlotItem";
import StoredSlotItem from "./StoredSlotItem";
import { useSlot } from "../../useConsensus";

const SlotItem: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const { error, isLoading, isValidating } = useSlot(slotNumber);

  if (isLoading) {
    return <LoadingSlotItem slotNumber={slotNumber} />;
  }
  if (error) {
    return (
      <NotFoundSlotItem slotNumber={slotNumber} isValidating={isValidating} />
    );
  }

  return <StoredSlotItem slotNumber={slotNumber} />;
};

export default memo(SlotItem);
