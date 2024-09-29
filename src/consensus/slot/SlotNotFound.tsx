import { FC, memo } from "react";
import { useHeadSlotNumber } from "../../useConsensus";
import { commify } from "../../utils/utils";
import SlotLink from "../components/SlotLink";

interface SlotNotFoundProps {
  slot: number | string;
  error?: Error;
}

const SlotNotFound: FC<SlotNotFoundProps> = ({ slot, error }) => {
  const headSlotNumber = useHeadSlotNumber();

  return (
    <div className="space-y-2 py-4 text-sm">
      {!error || (error instanceof Response && error.status === 404) ? (
        <>
          <p>
            Slot {typeof slot === "number" ? commify(slot) : slot} data not
            found.
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
        </>
      ) : error instanceof Response &&
        error.status >= 500 &&
        error.status < 600 ? (
        <>
          <p>
            <b>HTTP {error.status}: Internal Server Error</b> fetching this slot
            from the beacon node
          </p>
          <ul className="list-inside list-disc">
            <li>
              This problem was caused by the beacon node, possibly due to an
              implementation bug or database error.
            </li>
            <li>
              You may review the beacon node's output for more information.
            </li>
          </ul>
        </>
      ) : (
        <>Unknown eror fetching this slot</>
      )}
    </div>
  );
};

export default memo(SlotNotFound);
