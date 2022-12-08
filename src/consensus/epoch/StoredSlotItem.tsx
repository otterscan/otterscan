import { FC, memo } from "react";
import { commify } from "@ethersproject/units";
import SlotLink from "../components/SlotLink";
import SlotTimestamp from "./SlotTimestamp";
import ValidatorLink from "../components/ValidatorLink";
import BlockRoot from "../slot/BlockRoot";
import AggregationParticipation from "../slot/AggregationParticipation";
import { useSlot } from "../../useConsensus";

type StoredSlotItemProps = {
  slotNumber: number;
};

const StoredSlotItem: FC<StoredSlotItemProps> = ({ slotNumber }) => {
  const { slot } = useSlot(slotNumber);

  return (
    <div className="grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 hover:bg-skin-table-hover px-2 py-3">
      <SlotLink slotNumber={slotNumber} />
      <div>Proposed</div>
      <div className="truncate">
        <SlotTimestamp slotNumber={slotNumber} />
      </div>
      <ValidatorLink validatorIndex={slot.data.message.proposer_index} />
      <div className="truncate">
        <BlockRoot slotNumber={slotNumber} />
      </div>
      <div>
        {commify(slot.data.message.body.attestations.length.toString())}
      </div>
      <div className="col-span-2 self-center">
        {slot.data.message.body.sync_aggregate && (
          <AggregationParticipation
            hex={slot.data.message.body.sync_aggregate.sync_committee_bits}
          />
        )}
      </div>
      <div>{commify(slot.data.message.body.deposits.length.toString())}</div>
      <div></div>
      <div>
        {commify(slot.data.message.body.voluntary_exits.length.toString())}
      </div>
    </div>
  );
};

export default memo(StoredSlotItem);
