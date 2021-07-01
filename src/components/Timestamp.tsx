import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import TimestampAge from "./TimestampAge";

type TimestampProps = {
  value: number;
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Timestamp: React.FC<TimestampProps> = ({ value }) => {
  const d = new Date(value * 1000);
  let hour = d.getUTCHours() % 12;
  if (hour === 0) {
    hour = 12;
  }
  const am = d.getUTCHours() < 12;

  const tsString = `${months[d.getUTCMonth()]}-${d
    .getUTCDate()
    .toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    })}-${d.getUTCFullYear()} ${hour.toLocaleString(undefined, {
    minimumIntegerDigits: 2,
  })}:${d.getUTCMinutes().toLocaleString(undefined, {
    minimumIntegerDigits: 2,
  })}:${d.getUTCSeconds().toLocaleString(undefined, {
    minimumIntegerDigits: 2,
  })} ${am ? "AM" : "PM"} +UTC`;

  return (
    <div className="flex space-x-1 items-baseline">
      <FontAwesomeIcon className="self-center" icon={faClock} size="sm" />
      <span>
        <TimestampAge timestamp={value} /> ({tsString})
      </span>
    </div>
  );
};

export default React.memo(Timestamp);
