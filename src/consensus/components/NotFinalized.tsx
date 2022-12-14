import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const NotFinalized: FC = () => (
  <span className="flex items-baseline w-min rounded-lg space-x-1 px-3 py-1 bg-amber-50 text-amber-500 text-xs">
    <FontAwesomeIcon className="self-center" icon={faTimesCircle} size="1x" />
    <span>No</span>
  </span>
);

export default memo(NotFinalized);
