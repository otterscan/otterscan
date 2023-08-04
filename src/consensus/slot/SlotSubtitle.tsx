import { FC, memo } from "react";
import { SlotAwareComponentProps } from "../types";
import StandardSubtitle from "../../components/StandardSubtitle";
import NavBlock from "../../components/NavBlock";
import { slotURL } from "../../url";
import { useHeadSlotNumber } from "../../useConsensus";

const SlotSubtitle: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const headSlotNumber = useHeadSlotNumber();

  return (
    <StandardSubtitle>
      <div className="flex items-baseline space-x-1">
        <span>Slot</span>
        <span className="text-base text-gray-500">#{slotNumber}</span>
        {headSlotNumber !== undefined && (
          <NavBlock
            entityNum={slotNumber}
            latestEntityNum={headSlotNumber}
            urlBuilder={slotURL}
          />
        )}
      </div>
    </StandardSubtitle>
  );
};

export default memo(SlotSubtitle);
