import { FC } from "react";
import { useSlot } from "../../useConsensus";
import { SlotAwareComponentProps } from "../types";

const AttestationsTabTitle: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const { slot, error, isLoading } = useSlot(slotNumber);

  return (
    <>
      Attestations
      {slot && ` (${slot.data.message.body.attestations.length ?? 0})`}
    </>
  );
};

export default AttestationsTabTitle;
