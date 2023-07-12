import { FC, memo } from "react";
import { useValidator } from "../../useConsensus";
import RawValidatorLink from "./ValidatorLink";

type CheckedValidatorLinkProps = {
  validatorIndex: number;
};

const CheckedValidatorLink: FC<CheckedValidatorLinkProps> = ({
  validatorIndex,
}) => {
  const validator = useValidator(validatorIndex);
  const slashed = validator?.data.validator.slashed;

  return <RawValidatorLink validatorIndex={validatorIndex} slashed={slashed} />;
};

export default memo(CheckedValidatorLink);
