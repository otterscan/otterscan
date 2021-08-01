import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

type NonceProps = {
  value: number;
};

const Nonce: React.FC<NonceProps> = ({ value }) => (
  <span
    className="flex items-baseline space-x-2 rounded-lg px-2 py-1 bg-green-50 text-xs"
    title="Nonce"
  >
    <span className="text-green-400">
      <FontAwesomeIcon icon={faArrowUp} size="1x" />
    </span>
    <span className="text-green-600">{value}</span>
  </span>
);

export default React.memo(Nonce);
