import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";

export enum Direction {
  IN,
  OUT,
  SELF,
  INTERNAL,
}

type TransactionDirectionProps = {
  direction?: Direction;
};

const TransactionDirection: React.FC<TransactionDirectionProps> = ({
  direction,
}) => {
  let bgColor = "bg-green-50";
  let fgColor = "text-green-500";
  let msg: string | null = null;

  if (direction === Direction.IN) {
    msg = "IN";
  } else if (direction === Direction.OUT) {
    bgColor = "bg-yellow-100";
    fgColor = "text-yellow-600";
    msg = "OUT";
  } else if (direction === Direction.SELF) {
    bgColor = "bg-gray-200";
    fgColor = "text-gray-500";
    msg = "SELF";
  } else if (direction === Direction.INTERNAL) {
    msg = "INT";
  }

  return (
    <span
      className={`${bgColor} ${fgColor} ${
        direction !== undefined
          ? "px-2 py-1 rounded-lg"
          : "w-5 h-5 rounded-full flex justify-center items-center"
      } text-xs font-bold`}
    >
      {msg ?? (
        <span>
          <FontAwesomeIcon icon={faLongArrowAltRight} />
        </span>
      )}
    </span>
  );
};

export default React.memo(TransactionDirection);
