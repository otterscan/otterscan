import { FC, memo } from "react";
import ValidatorLink from "../components/ValidatorLink";
import { useCommittee } from "../../useConsensus";

type ValidatorListProps = {
  slotNumber: number;
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
        <ValidatorLink key={v} validatorIndex={v} />
      ))}
    </div>
  );
};

export default memo(ValidatorList);
