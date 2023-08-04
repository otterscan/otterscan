import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import ContentFrame from "../../components/ContentFrame";
import OverviewSkeleton from "./OverviewSkeleton";
import SlotNotFound from "./SlotNotFound";
import Attestation from "./Attestation";
import { useSlot } from "../../useConsensus";

const Attestations: FC = () => {
  const { slotNumber } = useParams();
  if (slotNumber === undefined) {
    throw new Error("slotNumber couldn't be undefined here");
  }
  const slotAsNumber = parseInt(slotNumber);
  const { slot, error, isLoading } = useSlot(slotAsNumber);
  useEffect(() => {
    if (slot !== undefined) {
      document.title = `Attestations for #${slotNumber} | Otterscan`;
    }
  }, [slotNumber, slot]);

  return (
    <ContentFrame tabs>
      {isLoading ? (
        <OverviewSkeleton />
      ) : error ? (
        <SlotNotFound slotNumber={slotAsNumber} />
      ) : (
        <>
          {slot.data.message.body.attestations.map((att: any, i: any) => (
            <Attestation key={i} idx={i} att={att} />
          ))}
        </>
      )}
    </ContentFrame>
  );
};

export default Attestations;
