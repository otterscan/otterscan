import { FC, memo } from "react";
import { commify } from "@ethersproject/units";
import SlotLink from "../components/SlotLink";
import TimestampAge from "../../components/TimestampAge";
import ValidatorLink from "../components/ValidatorLink";
import HexValue from "../../components/HexValue";
import AggregationParticipation from "../slot/AggregationParticipation";
import {
  useBlockRoot,
  useHeadSlot,
  useSlot,
  useSlotTimestamp,
} from "../../useConsensus";

type SlotItemProps = {
  slotNumber: number;
  expectedProposer: string;
};

const SlotItem: FC<SlotItemProps> = ({ slotNumber, expectedProposer }) => {
  const slot = useSlot(slotNumber);
  const blockRoot = useBlockRoot(slotNumber);
  const slotTimestamp = useSlotTimestamp(slotNumber);
  const headSlot = useHeadSlot();
  const headSlotAsNumber =
    headSlot === undefined
      ? undefined
      : parseInt(headSlot.data.header.message.slot);

  return (
    <div className="grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 hover:bg-skin-table-hover px-2 py-3">
      {slot && blockRoot ? (
        <>
          <SlotLink slotNumber={slotNumber} />
          <div>Proposed</div>
          <div className="truncate">
            {slotTimestamp && (
              <TimestampAge timestamp={slotTimestamp.toNumber()} />
            )}
          </div>
          <ValidatorLink validatorIndex={slot.data.message.proposer_index} />
          <div className="truncate">
            <HexValue value={blockRoot.data.root} />
          </div>
          <div>
            {commify(slot.data.message.body.attestations.length.toString())}
          </div>
          <div className="col-span-2">
            <AggregationParticipation
              hex={slot.data.message.body.sync_aggregate.sync_committee_bits}
            />
          </div>
          <div>
            {commify(slot.data.message.body.deposits.length.toString())}
          </div>
          <div></div>
          <div>
            {commify(slot.data.message.body.voluntary_exits.length.toString())}
          </div>
        </>
      ) : headSlotAsNumber !== undefined &&
        headSlotAsNumber > slotNumber + 1 ? (
        <>
          <SlotLink slotNumber={slotNumber} missed />
          <div>Missed</div>
          <div>
            {slotTimestamp && (
              <TimestampAge timestamp={slotTimestamp.toNumber()} />
            )}
          </div>
          <ValidatorLink validatorIndex={parseInt(expectedProposer)} />
          <div>-</div>
          <div>-</div>
          <div className="col-span-2"></div>
          <div>-</div>
          <div></div>
          <div>-</div>
        </>
      ) : (
        <>
          <SlotLink slotNumber={slotNumber} scheduled />
          <div>Scheduled</div>
          <div>
            {slotTimestamp && (
              <TimestampAge timestamp={slotTimestamp.toNumber()} />
            )}
          </div>
          <ValidatorLink validatorIndex={parseInt(expectedProposer)} />
          <div>-</div>
          <div>-</div>
          <div className="col-span-2"></div>
          <div>-</div>
          <div></div>
          <div>-</div>
        </>
      )}
    </div>
  );
};

export default memo(SlotItem);
