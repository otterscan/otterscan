import {
  FC,
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  FastTickerContext,
  SlowTickerContext,
  useCurrentTimeFastRefresh,
  useCurrentTimeSlowRefresh,
  useTicker,
} from "../useTicker";
import Age from "./Age";

const ONE_SECOND = 1_000;
const ONE_MINUTE = 60_000;

// Before/after 1 minute switch to slow refresh
const FAST_2_SLOW_THREASHOLD = 60;

type AutoRefreshAgeProps = {
  timestamp: number;
};

const AutoRefreshAge: FC<AutoRefreshAgeProps> = ({ timestamp }) => {
  const [last, setLast] = useState<Date>(new Date());
  const newSetLast = useCallback(
    (newLast: Date) => {
      setLast((prev: Date) => {
        if (prev.getTime() > newLast.getTime()) {
          return prev;
        }
        return newLast;
      });
    },
    [setLast],
  );

  const lastInSecs = Math.round(last.getTime() / 1000);
  const durationInSecs = lastInSecs - timestamp;

  return Math.abs(durationInSecs) <= FAST_2_SLOW_THREASHOLD ? (
    <FastRefreshTriggerAge
      setLast={newSetLast}
      durationInSecs={durationInSecs}
    />
  ) : (
    <SlowRefreshTriggerAge
      setLast={newSetLast}
      durationInSecs={durationInSecs}
    />
  );
};

export const TickerContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const nowFastRefresh = useTicker(ONE_SECOND);
  const nowSlowRefresh = useTicker(ONE_MINUTE);

  return (
    <FastTickerContext.Provider value={nowFastRefresh}>
      <SlowTickerContext.Provider value={nowSlowRefresh}>
        {children}
      </SlowTickerContext.Provider>
    </FastTickerContext.Provider>
  );
};

type RefreshTriggerAgeProps = {
  setLast: (newLast: Date) => void;
  durationInSecs: number;
};

const FastRefreshTriggerAge: FC<RefreshTriggerAgeProps> = ({
  setLast,
  durationInSecs,
}) => {
  const now = useCurrentTimeFastRefresh();
  useEffect(() => {
    setLast(now);
  }, [now]);

  return <Age durationInSecs={durationInSecs} />;
};

const SlowRefreshTriggerAge: FC<RefreshTriggerAgeProps> = ({
  setLast,
  durationInSecs,
}) => {
  const now = useCurrentTimeSlowRefresh();
  useEffect(() => {
    setLast(now);
  }, [now]);

  return <Age durationInSecs={durationInSecs} />;
};

export default memo(AutoRefreshAge);
