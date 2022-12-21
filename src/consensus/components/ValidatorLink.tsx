import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import { validatorURL } from "../../url";
import { useValidator } from "../../useConsensus";

type ValidatorLinkProps = {
  validatorIndex: number;
};

const ValidatorLink: FC<ValidatorLinkProps> = ({ validatorIndex }) => {
  const validator = useValidator(validatorIndex);
  const isSlashed = validator?.data.validator.slashed;

  let text = commify(validatorIndex);

  return (
    <NavLink
      className={`flex space-x-1 items-baseline font-blocknum ${
        isSlashed
          ? "line-through text-red-600 hover:text-red-800"
          : "text-link-blue hover:text-link-blue-hover"
      }`}
      to={validatorURL(validatorIndex)}
    >
      {isSlashed ? (
        <span className="text-red-600 hover:text-red-800">
          <FontAwesomeIcon
            className="self-center"
            icon={faUserSlash}
            size="1x"
          />
        </span>
      ) : (
        <span className="text-cyan-600">
          <FontAwesomeIcon className="self-center" icon={faUser} size="1x" />
        </span>
      )}
      <span>{text}</span>
    </NavLink>
  );
};

export default memo(ValidatorLink);
