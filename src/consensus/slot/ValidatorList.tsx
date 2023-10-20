import { FC, memo } from "react";
import { useCommittee } from "../../useConsensus";
import CheckedValidatorLink from "../components/CheckedValidatorLink";
import { SlotAwareComponentProps } from "../types";

type ValidatorListProps = SlotAwareComponentProps & {
  committeeIndex: number;
};

const ValidatorList: FC<ValidatorListProps> = ({
  slotNumber,
  committeeIndex,
}) => {
  const validators = useCommittee(slotNumber, committeeIndex);
  if (!validators) {
    return <></>;
  }

  return (
    <div className="grid grid-cols-8 ">
      {validators.data[0].validators.map((v: any) => (
        <CheckedValidatorLink key={v} validatorIndex={v} />
      ))}
    </div>
  );
};

export default memo(ValidatorList);
