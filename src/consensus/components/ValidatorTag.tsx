import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import { commify } from "../../utils/utils";

type ValidatorTagProps = {
  validatorIndex: number;
  slashed?: boolean;
  isLink?: boolean;
};

const ValidatorTag: FC<ValidatorTagProps> = ({
  validatorIndex,
  slashed,
  isLink,
}) => {
  let text = commify(validatorIndex);

  return (
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
        <span className={isLink ? "text-cyan-600" : "text-cyan-800"}>
          <FontAwesomeIcon className="self-center" icon={faUser} size="1x" />
        </span>
      )}
      <span>{text}</span>
    </>
  );
};

export default memo(ValidatorTag);
