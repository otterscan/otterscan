import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const NotFinalized: FC = () => (
  <span className="flex w-min items-baseline space-x-1 rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-500">
    <FontAwesomeIcon className="self-center" icon={faTimesCircle} size="1x" />
    <span>No</span>
  </span>
);

export default memo(NotFinalized);
