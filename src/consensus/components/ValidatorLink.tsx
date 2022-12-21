import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { validatorURL } from "../../url";

type ValidatorLinkProps = {
  validatorIndex: number;
};

const ValidatorLink: FC<ValidatorLinkProps> = ({ validatorIndex }) => {
  let text = commify(validatorIndex);

  return (
    <NavLink
      className="flex space-x-1 items-baseline text-link-blue hover:text-link-blue-hover font-blocknum"
      to={validatorURL(validatorIndex)}
    >
      <span className="text-cyan-600">
        <FontAwesomeIcon className="self-center" icon={faUser} size="1x" />
      </span>
      <span>{text}</span>
    </NavLink>
  );
};

export default memo(ValidatorLink);
