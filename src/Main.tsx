import React, { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { SourcifySource } from "./sourcify/useSourcify";
import { AppConfig, AppConfigContext } from "./useAppConfig";

const Main: React.FC = () => {
  const [sourcifySource, setSourcifySource] = useState<SourcifySource>(
    SourcifySource.CENTRAL_SERVER,
  );
  const appConfig = useMemo((): AppConfig => {
    return {
      sourcifySource,
      setSourcifySource,
    };
  }, [sourcifySource, setSourcifySource]);

  return (
    <AppConfigContext.Provider value={appConfig}>
      <Header sourcifyPresent={true} />
      <Outlet />
    </AppConfigContext.Provider>
  );
};

export default Main;
