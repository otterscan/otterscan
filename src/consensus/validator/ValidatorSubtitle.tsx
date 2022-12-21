import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSlash } from "@fortawesome/free-solid-svg-icons";
import StandardSubtitle from "../../StandardSubtitle";

type ValidatorSubtitleProps = {
  validatorIndex: number | string;
  slashed?: boolean;
};

const ValidatorSubtitle: FC<ValidatorSubtitleProps> = ({
  validatorIndex,
  slashed,
}) => (
  <StandardSubtitle>
    <div className="flex space-x-1 items-baseline">
      <span>Validator</span>
      <span className="text-base text-gray-500">#{validatorIndex}</span>
      {slashed && (
        <span className="text-sm text-red-600 bg-red-200 space-x-2 rounded-xl border border-red-600 px-2 py-1">
          <span className="">
            <FontAwesomeIcon
              className="self-center"
              icon={faUserSlash}
              size="1x"
            />
          </span>
          <span>slashed</span>
        </span>
      )}
    </div>
  </StandardSubtitle>
);

export default memo(ValidatorSubtitle);
