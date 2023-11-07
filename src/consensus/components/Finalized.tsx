import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";

const Finalized: FC = () => (
  <span className="flex w-min items-baseline space-x-1 rounded-lg bg-emerald-50 px-3 py-1 text-xs text-emerald-500">
    <FontAwesomeIcon className="self-center" icon={faCheckCircle} size="1x" />
    <span>Yes</span>
  </span>
);

export default memo(Finalized);
