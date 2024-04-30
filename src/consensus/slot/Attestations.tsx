import { FC } from "react";
import { useParams } from "react-router-dom";
import ContentFrame from "../../components/ContentFrame";
import { useSlot } from "../../useConsensus";
import { usePageTitle } from "../../useTitle";
import Attestation from "./Attestation";
import OverviewSkeleton from "./OverviewSkeleton";
import SlotNotFound from "./SlotNotFound";

const Attestations: FC = () => {
  const { slotNumber } = useParams();
  if (slotNumber === undefined) {
    throw new Error("slotNumber couldn't be undefined here");
  }
  const slotAsNumber = parseInt(slotNumber);
  const { slot, error, isLoading } = useSlot(slotAsNumber);
  usePageTitle(
    slotNumber === undefined ? undefined : `Attestations for #${slotNumber}`,
  );

  return (
    <ContentFrame tabs>
      {isLoading ? (
        <OverviewSkeleton />
      ) : error ? (
        <SlotNotFound slot={slotAsNumber} />
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
