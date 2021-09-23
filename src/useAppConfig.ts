import React, { useContext } from "react";
import { SourcifySource } from "./url";

export type AppConfig = {
  sourcifySource: SourcifySource;
  setSourcifySource: (newSourcifySource: SourcifySource) => void;
};

export const AppConfigContext = React.createContext<AppConfig>(undefined!);

export const useAppConfigContext = () => {
  return useContext(AppConfigContext);
};
