import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { validatorURL } from "../../url";
import { commify } from "../../utils/utils";

type ValidatorLinkProps = {
  validatorIndex: number;
  slashed?: boolean;
  disabled?: boolean;
};

const ValidatorLink: FC<ValidatorLinkProps> = ({
  validatorIndex,
  slashed,
  disabled = false,
}) => {
  const labelElement = (
    <>
      {slashed ? (
        <span className="text-red-600 hover:text-red-800">
          <FontAwesomeIcon
            className="self-center"
            icon={faUserSlash}
            size="1x"
          />
        </span>
      ) : (
        <span className={disabled ? "text-gray-500" : "text-cyan-600"}>
          <FontAwesomeIcon className="self-center" icon={faUser} size="1x" />
        </span>
      )}
      <span>{commify(validatorIndex)}</span>
    </>
  );

  if (disabled) {
    return (
      <span className={`flex items-baseline space-x-1 font-blocknum`}>
        {labelElement}
      </span>
    );
  }
  return (
    <NavLink
      className={`flex items-baseline space-x-1 font-blocknum ${
        slashed
          ? "text-red-600 line-through hover:text-red-800"
          : "text-link-blue hover:text-link-blue-hover"
      }`}
      to={validatorURL(validatorIndex)}
    >
      {labelElement}
    </NavLink>
  );
};

export default memo(ValidatorLink);
