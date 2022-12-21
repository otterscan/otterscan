import { FC, memo } from "react";
import { useCurrentTimeFastRefresh } from "../useTicker";
import Age from "./Age";

type TimestampAgeProps = {
  timestamp: number;
};

const TimestampAge: FC<TimestampAgeProps> = ({ timestamp }) => {
  const now = useCurrentTimeFastRefresh();
  const nowInSecs = Math.round((now?.getTime() ?? Date.now()) / 1000);
  const durationInSecs = nowInSecs - timestamp;

  return <Age durationInSecs={durationInSecs} />;
};

export default memo(TimestampAge);
