import { createContext, useContext, useEffect, useState } from "react";

export const useTicker = (interval: number) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, interval);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return now;
};

export const FastTickerContext = createContext<Date>(undefined!);

export const SlowTickerContext = createContext<Date>(undefined!);

export const useCurrentTimeFastRefresh = () => {
  return useContext(FastTickerContext);
};

export const useCurrentTimeSlowRefresh = () => {
  return useContext(SlowTickerContext);
};
