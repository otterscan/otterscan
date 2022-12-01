import React from "react";
import { useCurrentTime } from "../useTicker";
import { ageString } from "../utils/utils";

type TimestampAgeProps = {
  timestamp: number;
};

const TimestampAge: React.FC<TimestampAgeProps> = ({ timestamp }) => {
  const now = useCurrentTime();
  const nowInSecs = Math.round((now?.getTime() ?? Date.now()) / 1000);
  const diff = nowInSecs - timestamp;
  const desc = ageString(diff);

  return (
    <span className="truncate" title={desc}>
      {desc}
    </span>
  );
};

export default React.memo(TimestampAge);
