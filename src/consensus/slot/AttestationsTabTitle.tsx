import { FC } from "react";
import { SlotAwareComponentProps } from "../types";
import { useSlot } from "../../useConsensus";

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
