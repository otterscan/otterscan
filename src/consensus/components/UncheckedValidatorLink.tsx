import { FC, memo } from "react";
import RawValidatorLink from "./ValidatorLink";

type UncheckedValidatorLinkProps = {
  validatorIndex: number;
};

// Shows a validator link without reading whether the validator was slashed
const UncheckedValidatorLink: FC<UncheckedValidatorLinkProps> = ({
  validatorIndex,
}) => {
  return <RawValidatorLink validatorIndex={validatorIndex} slashed={false} />;
};

export default memo(UncheckedValidatorLink);
