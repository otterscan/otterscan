import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";

const Finalized: FC = () => (
  <span className="flex items-baseline w-min rounded-lg space-x-1 px-3 py-1 bg-emerald-50 text-emerald-500 text-xs">
    <FontAwesomeIcon className="self-center" icon={faCheckCircle} size="1x" />
    <span>Yes</span>
  </span>
);

export default memo(Finalized);
