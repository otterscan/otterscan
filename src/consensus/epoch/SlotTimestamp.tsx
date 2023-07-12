import { FC } from "react";
import { SlotAwareComponentProps } from "../types";
import AutoRefreshAge from "../../components/AutoRefreshAge";
import { useSlotTimestamp } from "../../useConsensus";

const SlotTimestamp: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const slotTimestamp = useSlotTimestamp(slotNumber);
  if (slotTimestamp === undefined) {
    return <></>;
  }

  return <AutoRefreshAge timestamp={slotTimestamp} />;
};

export default SlotTimestamp;
