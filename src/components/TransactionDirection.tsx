import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faLongArrowAltRight,
} from "@fortawesome/free-solid-svg-icons";

export enum Direction {
  IN,
  OUT,
  SELF,
  INTERNAL,
}

export enum Flags {
  // Means the transaction internal sends ETH to the miner, e.g. flashbots
  MINER,
}

type TransactionDirectionProps = {
  direction?: Direction;
  flags?: Flags;
};

const TransactionDirection: React.FC<TransactionDirectionProps> = ({
  direction,
  flags,
}) => {
  let bgColor = "bg-emerald-50";
  let fgColor = "text-emerald-500";
  let msg: string | null = null;

  if (direction === Direction.IN) {
    msg = "IN";
  } else if (direction === Direction.OUT) {
    bgColor = "bg-amber-100";
    fgColor = "text-amber-600";
    msg = "OUT";
  } else if (direction === Direction.SELF) {
    bgColor = "bg-gray-200";
    fgColor = "text-gray-500";
    msg = "SELF";
  } else if (direction === Direction.INTERNAL) {
    msg = "INT";
    bgColor = "bg-emerald-100";
  }

  if (flags === Flags.MINER) {
    bgColor = "bg-amber-50";
    fgColor = "text-amber-400";
  }

  return (
    <span
      className={`${bgColor} ${fgColor} ${
        direction !== undefined
          ? "rounded-lg px-2 py-1"
          : "flex h-5 w-5 items-center justify-center rounded-full"
      } text-xs font-bold`}
    >
      {flags === Flags.MINER ? (
        <FontAwesomeIcon icon={faCoins} size="1x" />
      ) : (
        msg ?? (
          <span>
            <FontAwesomeIcon icon={faLongArrowAltRight} />
          </span>
        )
      )}
    </span>
  );
};

export default React.memo(TransactionDirection);
