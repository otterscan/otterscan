import { FC, memo } from "react";
import NavBlock from "../../components/NavBlock";
import StandardSubtitle from "../../components/StandardSubtitle";
import { slotURL } from "../../url";
import { useHeadSlotNumber } from "../../useConsensus";
import { SlotAwareComponentProps } from "../types";

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
