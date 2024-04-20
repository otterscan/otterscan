import { FC, memo } from "react";
import { useHeadSlotNumber } from "../../useConsensus";
import { commify } from "../../utils/utils";
import SlotLink from "../components/SlotLink";

interface SlotNotFoundProps {
  slot: number | string;
}

const SlotNotFound: FC<SlotNotFoundProps> = ({ slot }) => {
  const headSlotNumber = useHeadSlotNumber();

  return (
    <div className="space-y-2 py-4 text-sm">
      <p>
        Slot {typeof slot === "number" ? commify(slot) : slot} data not found.
      </p>
      {headSlotNumber !== undefined &&
      typeof slot === "number" &&
      slot > headSlotNumber ? (
        <p className="flex space-x-2">
          <span>Head slot is:</span>
          <SlotLink slot={headSlotNumber} />
        </p>
      ) : (
        <>
          <p>Possible causes:</p>
          <ul className="list-inside list-disc">
            <li>Missed slot</li>
            <li>CL does not have the slot data</li>
          </ul>
        </>
      )}
    </div>
  );
};

export default memo(SlotNotFound);
