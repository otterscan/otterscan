import { FC } from "react";
import { useSlot } from "../../useConsensus";

type AttestationsTabTitleProps = {
  slotNumber: number;
};

const AttestationsTabTitle: FC<AttestationsTabTitleProps> = ({
  slotNumber,
}) => {
  const { slot, error, isLoading } = useSlot(slotNumber);

  return (
    <>
      Attestations
      {slot && ` (${slot.data.message.body.attestations.length ?? 0})`}
    </>
  );
};

export default AttestationsTabTitle;
