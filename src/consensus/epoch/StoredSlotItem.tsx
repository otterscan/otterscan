import { FC, memo } from "react";
import { commify } from "@ethersproject/units";
import { SlotAwareComponentProps } from "../types";
import SlotLink from "../components/SlotLink";
import BlockLink from "../../components/BlockLink";
import SlotTimestamp from "./SlotTimestamp";
import ValidatorLink from "../components/ValidatorLink";
import BlockRoot from "../slot/BlockRoot";
import SlotAttestationsLink from "../components/SlotAttestationsLink";
import AggregationParticipation from "../slot/AggregationParticipation";
import { useSlot } from "../../useConsensus";

const StoredSlotItem: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const { slot } = useSlot(slotNumber);

  return (
    <tr>
      <td>
        <SlotLink slotNumber={slotNumber} />
      </td>
      <td>Proposed</td>
      <td>
        {slot.data.message.body.execution_payload && (
          <BlockLink
            blockTag={slot.data.message.body.execution_payload.block_number}
          />
        )}
      </td>
      <td>
        <SlotTimestamp slotNumber={slotNumber} />
      </td>
      <td>
        <ValidatorLink validatorIndex={slot.data.message.proposer_index} />
      </td>
      <td>
        <BlockRoot slotNumber={slotNumber} />
      </td>
      <td>
        <SlotAttestationsLink slotNumber={slotNumber}>
          {commify(slot.data.message.body.attestations.length.toString())}
        </SlotAttestationsLink>
      </td>
      <td className="self-center">
        {slot.data.message.body.sync_aggregate && (
          <AggregationParticipation
            hex={slot.data.message.body.sync_aggregate.sync_committee_bits}
          />
        )}
      </td>
      <td>{commify(slot.data.message.body.deposits.length.toString())}</td>
      <td>
        {commify(slot.data.message.body.attester_slashings.length.toString())} /{" "}
        {commify(slot.data.message.body.proposer_slashings.length.toString())}
      </td>
      <td>
        {commify(slot.data.message.body.voluntary_exits.length.toString())}
      </td>
    </tr>
  );
};

export default memo(StoredSlotItem);
