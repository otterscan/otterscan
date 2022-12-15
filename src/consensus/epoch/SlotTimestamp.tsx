import { FC } from "react";
import { SlotAwareComponentProps } from "../types";
import TimestampAge from "../../components/TimestampAge";
import { useSlotTimestamp } from "../../useConsensus";

const SlotTimestamp: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const slotTimestamp = useSlotTimestamp(slotNumber);
  if (slotTimestamp === undefined) {
    return <></>;
  }

  return <TimestampAge timestamp={slotTimestamp} />;
};

export default SlotTimestamp;
