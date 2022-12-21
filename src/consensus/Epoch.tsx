import { FC, memo, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import StandardFrame from "../StandardFrame";
import EpochSubtitle from "./epoch/EpochSubtitle";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import Finalized from "./components/Finalized";
import NotFinalized from "./components/NotFinalized";
import Timestamp from "../components/Timestamp";
import { TickerContextProvider } from "../components/AutoRefreshAge";
import SlotItem from "./epoch/SlotItem";
import { SelectionContext, useSelection } from "../useSelection";
import {
  useEpochTimestamp,
  useFinalizedSlotNumber,
  useReversedSlotsFromEpoch,
} from "../useConsensus";

const Epoch: FC = () => {
  const { epochNumber } = useParams();
  if (epochNumber === undefined) {
    throw new Error("epochNumber couldn't be undefined here");
  }
  const epochAsNumber = parseInt(epochNumber);
  useEffect(() => {
    if (!isNaN(epochAsNumber)) {
      document.title = `Epoch #${epochAsNumber} | Otterscan`;
    }
  }, [epochAsNumber]);

  const selectionCtx = useSelection();

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
      <SelectionContext.Provider value={selectionCtx}>
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
          <table className="w-full border-t border-b border-gray-200 px-2 py-2 text-sm text-left table-fixed [&>*>tr]:items-baseline">
            <thead>
              <tr className="text-gray-500 bg-gray-100 [&>th]:px-2 [&>th]:py-2 [&>th]:truncate">
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
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-gray-200 hover:[&>tr]:bg-skin-table-hover [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr>td]:truncate">
              <TickerContextProvider>
                <SlotList slots={slots} />
              </TickerContextProvider>
            </tbody>
          </table>
        </ContentFrame>
      </SelectionContext.Provider>
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
