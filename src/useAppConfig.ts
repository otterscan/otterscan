import React, { useContext } from "react";
import { SourcifySourceName } from "./sourcify/useSourcify";

export type AppConfig = {
  sourcifySource: SourcifySourceName | null;
  setSourcifySource: (newSourcifySource: SourcifySourceName) => void;
};

export const AppConfigContext = React.createContext<AppConfig>(undefined!);

export const useAppConfigContext = () => {
  return useContext(AppConfigContext);
};
