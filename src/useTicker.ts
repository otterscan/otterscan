import { createContext, useContext, useEffect, useState } from "react";

export const useTicker = () => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return now;
};

export const TimeContext = createContext<Date>(undefined!);

export const useCurrentTime = () => {
  return useContext(TimeContext);
};
