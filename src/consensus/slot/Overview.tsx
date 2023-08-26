import { FC, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toUtf8String } from "ethers";
import ContentFrame from "../../components/ContentFrame";
import OverviewSkeleton from "./OverviewSkeleton";
import SlotNotFound from "./SlotNotFound";
import InfoRow from "../../components/InfoRow";
import Timestamp from "../../components/Timestamp";
import EpochLink from "../components/EpochLink";
import BlockLink from "../../components/BlockLink";
import CheckedValidatorLink from "../components/CheckedValidatorLink";
import BlockRoot from "./BlockRoot";
import HexValue from "../../components/HexValue";
import RelevantNumericValue from "../../components/RelevantNumericValue";
import AggregationParticipation from "./AggregationParticipation";
import AggregationBits from "./AggregationBits";
import SlashingCount from "../components/SlashingCount";
import { slot2Epoch, useSlot, useSlotTimestamp } from "../../useConsensus";
import { commify } from "../../utils/utils";

const Overview: FC = () => {
  const { slotNumber } = useParams();
  if (slotNumber === undefined) {
    throw new Error("slotNumber couldn't be undefined here");
  }
  const slotAsNumber = parseInt(slotNumber);
  const { slot, error, isLoading } = useSlot(slotAsNumber);
  useEffect(() => {
    if (slot !== undefined) {
      document.title = `Slot #${slotNumber} | Otterscan`;
    }
  }, [slotNumber, slot]);

  const epoch = slot2Epoch(slotAsNumber);
  const slotTimestamp = useSlotTimestamp(slotAsNumber);

  const graffiti = useMemo(() => {
    try {
      return slot && toUtf8String(slot.data.message.body.graffiti);
    } catch (err) {
      console.info("Error while converting slot graffiti to string");
      console.info(err);
    }
  }, [slot]);

  return (
    <ContentFrame tabs>
      {isLoading ? (
        <OverviewSkeleton />
      ) : error ? (
        <SlotNotFound slotNumber={slotAsNumber} />
      ) : (
        <>
          <InfoRow title="Timestamp">
            {slotTimestamp && <Timestamp value={slotTimestamp} />}
          </InfoRow>
          <InfoRow title="Epoch">
            <EpochLink epochNumber={epoch} />
          </InfoRow>
          {slot.data.message.body.execution_payload && (
            <InfoRow title="Block Number">
              <BlockLink
                blockTag={slot.data.message.body.execution_payload.block_number}
              />
            </InfoRow>
          )}
          <InfoRow title="Proposer">
            <CheckedValidatorLink validatorIndex={slot.data.message.proposer_index} />
          </InfoRow>
          <InfoRow title="Block Root">
            <BlockRoot slotNumber={slotAsNumber} />
          </InfoRow>
          <InfoRow title="Parent Root">
            <HexValue value={slot.data.message.parent_root} />
          </InfoRow>
          <InfoRow title="State Root">
            <HexValue value={slot.data.message.state_root} />
          </InfoRow>
          <InfoRow title="Signature">
            <HexValue value={slot.data.signature} />
          </InfoRow>
          <InfoRow title="Randao Reveal">
            <HexValue value={slot.data.message.body.randao_reveal} />
          </InfoRow>
          <InfoRow title="Graffiti">
            {graffiti} (Hex:{" "}
            <HexValue value={slot.data.message.body.graffiti} />)
          </InfoRow>
          <InfoRow title="ETH1 Block Hash">
            <BlockLink blockTag={slot.data.message.body.eth1_data.block_hash} />
          </InfoRow>
          <InfoRow title="ETH1 Deposit Root">
            <HexValue value={slot.data.message.body.eth1_data.deposit_root} />
          </InfoRow>
          <InfoRow title="ETH1 Deposit Count">
            <RelevantNumericValue
              value={slot.data.message.body.eth1_data.deposit_count}
            />
          </InfoRow>
          {slot.data.message.body.sync_aggregate && (
            <>
              <InfoRow title="Sync Aggregate Participation">
                <AggregationParticipation
                  hex={
                    slot.data.message.body.sync_aggregate.sync_committee_bits
                  }
                />
              </InfoRow>
              <InfoRow title="Sync Aggregate Bits">
                <AggregationBits
                  hex={
                    slot.data.message.body.sync_aggregate.sync_committee_bits
                  }
                />
              </InfoRow>
              <InfoRow title="Sync Aggregate Signature">
                <HexValue
                  value={
                    slot.data.message.body.sync_aggregate
                      .sync_committee_signature
                  }
                />
              </InfoRow>
            </>
          )}
          <InfoRow title="Voluntary Exits">
            <RelevantNumericValue
              value={slot.data.message.body.voluntary_exits.length}
            />
          </InfoRow>
          <InfoRow title="Slashings (Attester/Proposer)">
            <SlashingCount slot={slot} />
          </InfoRow>
          <InfoRow title="Deposits">
            <RelevantNumericValue
              value={slot.data.message.body.deposits.length}
            />
          </InfoRow>
        </>
      )}
    </ContentFrame>
  );
};

export default Overview;
