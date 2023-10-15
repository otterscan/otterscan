import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { validatorURL } from "../../url";
import ValidatorTag from "./ValidatorTag";

type ValidatorLinkProps = {
  validatorIndex: number;
  slashed?: boolean;
};

const ValidatorLink: FC<ValidatorLinkProps> = ({ validatorIndex, slashed }) => {
  return (
    <NavLink
      className={`flex items-baseline space-x-1 font-blocknum ${
        slashed
          ? "text-red-600 line-through hover:text-red-800"
          : "text-link-blue hover:text-link-blue-hover"
      }`}
      to={validatorURL(validatorIndex)}
    >
      <ValidatorTag validatorIndex={validatorIndex} slashed={slashed} isLink />
    </NavLink>
  );
};

export default memo(ValidatorLink);
