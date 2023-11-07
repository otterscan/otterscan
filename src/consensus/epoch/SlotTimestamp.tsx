import { FC } from "react";
import AutoRefreshAge from "../../components/AutoRefreshAge";
import { useSlotTimestamp } from "../../useConsensus";
import { SlotAwareComponentProps } from "../types";

const SlotTimestamp: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const slotTimestamp = useSlotTimestamp(slotNumber);
  if (slotTimestamp === undefined) {
    return <></>;
  }

  return <AutoRefreshAge timestamp={slotTimestamp} />;
};

export default SlotTimestamp;
