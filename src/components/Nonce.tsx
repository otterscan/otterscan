import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";
import { commify } from "../utils/utils";

type NonceProps = {
  value: bigint;
};

const Nonce: FC<NonceProps> = ({ value }) => (
  <span
    className="flex-inline items-baseline space-x-2 rounded-lg bg-emerald-50 px-2 py-1 text-xs"
    title="Nonce"
  >
    <span className="text-emerald-400">
      <FontAwesomeIcon icon={faArrowUp} size="1x" />
    </span>
    <span className="text-emerald-600">{commify(value)}</span>
  </span>
);

export default memo(Nonce);
