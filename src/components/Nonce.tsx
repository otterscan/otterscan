import { FC, memo } from "react";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

type NonceProps = {
  value: number;
};

const Nonce: FC<NonceProps> = ({ value }) => (
  <span
    className="flex items-baseline space-x-2 rounded-lg bg-emerald-50 px-2 py-1 text-xs"
    title="Nonce"
  >
    <span className="text-emerald-400">
      <FontAwesomeIcon icon={faArrowUp} size="1x" />
    </span>
    <span className="text-emerald-600">{commify(value)}</span>
  </span>
);

export default memo(Nonce);
