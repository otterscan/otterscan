import { FC } from "react";
import TimestampAge from "../../components/TimestampAge";
import { useSlotTimestamp } from "../../useConsensus";

type SlotTimestampProps = {
  slotNumber: number;
};

const SlotTimestamp: FC<SlotTimestampProps> = ({ slotNumber }) => {
  const slotTimestamp = useSlotTimestamp(slotNumber);
  if (slotTimestamp === undefined) {
    return <div>LOADING TS</div>;
  }

  return <TimestampAge timestamp={slotTimestamp} />;
};

export default SlotTimestamp;
