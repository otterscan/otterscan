import { FC, memo, useMemo } from "react";
import { useParams } from "react-router-dom";
import { TickerContextProvider } from "../components/AutoRefreshAge";
import ContentFrame from "../components/ContentFrame";
import InfoRow from "../components/InfoRow";
import StandardFrame from "../components/StandardFrame";
import StandardTBody from "../components/StandardTBody";
import StandardTHead from "../components/StandardTHead";
import StandardTable from "../components/StandardTable";
import Timestamp from "../components/Timestamp";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import {
  useEpochTimestamp,
  useFinalizedSlotNumber,
  useReversedSlotsFromEpoch,
} from "../useConsensus";
import { usePageTitle } from "../useTitle";
import Finalized from "./components/Finalized";
import NotFinalized from "./components/NotFinalized";
import EpochSubtitle from "./epoch/EpochSubtitle";
import SlotItem from "./epoch/SlotItem";

const Epoch: FC = () => {
  const { epochNumber } = useParams();
  if (epochNumber === undefined) {
    throw new Error("epochNumber couldn't be undefined here");
  }
  const epochAsNumber = parseInt(epochNumber);

  if (!isNaN(epochAsNumber)) {
    usePageTitle(`Epoch #${epochAsNumber}`);
  }

  const epochTimestamp = useEpochTimestamp(epochNumber);
  const slots = useReversedSlotsFromEpoch(epochAsNumber);
  const finalizedSlot = useFinalizedSlotNumber();

  const isFinalized = useMemo(() => {
    if (slots === undefined || finalizedSlot === undefined) {
      return undefined;
    }

    return slots[0] <= finalizedSlot;
  }, [slots, finalizedSlot]);

  return (
    <StandardFrame>
      <EpochSubtitle epochNumber={epochAsNumber} />
      <StandardSelectionBoundary>
        <ContentFrame key={epochAsNumber}>
          <InfoRow title="Finalized">
            {isFinalized === undefined ? (
              ""
            ) : isFinalized ? (
              <Finalized />
            ) : (
              <NotFinalized />
            )}
          </InfoRow>
          <InfoRow title="Timestamp">
            {epochTimestamp && <Timestamp value={epochTimestamp} />}
          </InfoRow>
          <StandardTable>
            <StandardTHead>
              <th className="w-28">Slot</th>
              <th className="w-24">Status</th>
              <th className="w-24">Block</th>
              <th className="w-32">Age</th>
              <th className="w-24">Proposer</th>
              <th>Root Hash</th>
              <th className="w-24">Attestations</th>
              <th className="w-48">Sync Participation</th>
              <th className="w-24">Deposits</th>
              <th className="w-28">Slashings A/P</th>
              <th className="w-24">Exits</th>
            </StandardTHead>
            <StandardTBody>
              <TickerContextProvider>
                <SlotList slots={slots} />
              </TickerContextProvider>
            </StandardTBody>
          </StandardTable>
        </ContentFrame>
      </StandardSelectionBoundary>
    </StandardFrame>
  );
};

type SlotListProps = {
  slots: number[];
};

const SlotList: FC<SlotListProps> = memo(({ slots }) => (
  <>
    {slots.map((s) => (
      <SlotItem key={s} slotNumber={s} />
    ))}
  </>
));

export default Epoch;
