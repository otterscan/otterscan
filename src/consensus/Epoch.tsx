import { FC, memo, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import StandardFrame from "../StandardFrame";
import StandardSubtitle from "../StandardSubtitle";
import EpochNavBlock from "./components/EpochNavBlock";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import Finalized from "./components/Finalized";
import NotFinalized from "./components/NotFinalized";
import Timestamp from "../components/Timestamp";
import SlotItem from "./epoch/SlotItem";
import { SelectionContext, useSelection } from "../useSelection";
import {
  useEpochTimestamp,
  useFinalizedSlotNumber,
  useSlotsFromEpoch,
} from "../useConsensus";
import { TimeContext, useTicker } from "../useTicker";

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
  const slots = useSlotsFromEpoch(epochAsNumber);
  const finalizedSlot = useFinalizedSlotNumber();

  const isFinalized = useMemo(() => {
    if (slots === undefined || finalizedSlot === undefined) {
      return undefined;
    }

    return slots[0] <= finalizedSlot;
  }, [slots, finalizedSlot]);

  const now = useTicker();

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex space-x-1 items-baseline">
          <span>Epoch</span>
          <span className="text-base text-gray-500">#{epochNumber}</span>
          {epochAsNumber && <EpochNavBlock epochNumber={epochAsNumber} />}
        </div>
      </StandardSubtitle>
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
          <div className="grid grid-cols-12 gap-x-1 bg-gray-100 border-t border-b border-gray-200 px-2 py-2 font-bold text-gray-500 text-sm">
            <div>Slot</div>
            <div>Status</div>
            <div>Age</div>
            <div>Proposer</div>
            <div>Root Hash</div>
            <div>Attestations</div>
            <div className="col-span-2">Sync Participation</div>
            <div>Deposits</div>
            <div>Slashings P/A</div>
            <div>Exits</div>
            <div></div>
            <div></div>
          </div>
          <div className="flex flex-col-reverse">
            <TimeContext.Provider value={now}>
              <SlotList slots={slots} />
            </TimeContext.Provider>
          </div>
        </ContentFrame>
      </SelectionContext.Provider>
    </StandardFrame>
  );
};

type SlotListProps = {
  slots: any[];
};

const SlotList: FC<SlotListProps> = memo(({ slots }) => (
  <>
    {slots.map((s) => (
      <SlotItem key={s} slotNumber={s} />
    ))}
  </>
));

export default Epoch;
