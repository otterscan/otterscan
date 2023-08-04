import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import { validatorURL } from "../../url";

type ValidatorLinkProps = {
  validatorIndex: number;
  slashed?: boolean;
};

const ValidatorLink: FC<ValidatorLinkProps> = ({ validatorIndex, slashed }) => {
  let text = commify(validatorIndex);

  return (
    <NavLink
      className={`flex items-baseline space-x-1 font-blocknum ${
        slashed
          ? "text-red-600 line-through hover:text-red-800"
          : "text-link-blue hover:text-link-blue-hover"
      }`}
      to={validatorURL(validatorIndex)}
    >
      {slashed ? (
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
