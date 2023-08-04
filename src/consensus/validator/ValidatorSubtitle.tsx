import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSlash } from "@fortawesome/free-solid-svg-icons";
import StandardSubtitle from "../../components/StandardSubtitle";

type ValidatorSubtitleProps = {
  validatorIndex: number | string;
  slashed?: boolean;
};

const ValidatorSubtitle: FC<ValidatorSubtitleProps> = ({
  validatorIndex,
  slashed,
}) => (
  <StandardSubtitle>
    <div className="flex items-baseline space-x-1">
      <span>Validator</span>
      <span className="text-base text-gray-500">#{validatorIndex}</span>
      {slashed && (
        <span className="space-x-2 rounded-xl border border-red-600 bg-red-200 px-2 py-1 text-sm text-red-600">
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
