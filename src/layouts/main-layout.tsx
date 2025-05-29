import { QueryClientProvider } from "@tanstack/react-query";
import { FC, Suspense, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Await, Outlet, useLoaderData } from "react-router";
import ErrorFallback from "../components/ErrorFallback";
import ConnectionErrorPanel from "../ConnectionErrorPanel";
import Footer from "../Footer";
import ProbeErrorHandler from "../ProbeErrorHandler";
import { queryClient } from "../queryClient";
import { SourcifySourceName } from "../sourcify/useSourcify";
import { ConnectionStatus } from "../types";
import { AppConfig, AppConfigContext } from "../useAppConfig";
import { ChainInfoContext, populateChainInfo } from "../useChainInfo";
import { loadOtterscanConfig, OtterscanConfig } from "../useConfig";
import { createRuntime, RuntimeContext } from "../useRuntime";
import WarningHeader from "../WarningHeader";

const config = loadOtterscanConfig();

const runtime = populateChainInfo(createRuntime(config));

/**
 * Triggers both config loading and runtime probing/building in parallel.
 *
 * Makes config available in a separate data variable in order to show
 * progress during probing.
 */
export async function clientLoader() {
  return {
    config,
    rt: runtime,
  };
}

const MainLayout: FC = () => {
  // Config + rt map; typings are not available here :(
  const data: any = useLoaderData();

  const [sourcifySource, setSourcifySource] =
    useState<SourcifySourceName | null>(null);

  const appConfig = useMemo((): AppConfig => {
    return {
      sourcifySource,
      setSourcifySource,
    };
  }, [sourcifySource, setSourcifySource]);

  return (
    // Catch all error boundary
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* wait for config load */}
      <Await resolve={data.config}>
        {(config: OtterscanConfig) => (
          // Wait for runtime building + probing; suspend while probing;
          // don't show probe splash if hardcoded chainId
          <Suspense
            fallback={
              config.experimentalFixedChainId === undefined && (
                <ConnectionErrorPanel
                  connStatus={ConnectionStatus.CONNECTING}
                  nodeURL={config.erigonURL!}
                />
              )
            }
          >
            <Await resolve={data.rt} errorElement={<ProbeErrorHandler />}>
              {(runtime) => (
                // App is healthy from here
                <QueryClientProvider client={queryClient}>
                  <RuntimeContext.Provider value={runtime}>
                    <ChainInfoContext.Provider
                      value={runtime.config!.chainInfo}
                    >
                      <AppConfigContext.Provider value={appConfig}>
                        <div className="flex h-screen flex-col">
                          <WarningHeader />
                          <Outlet />
                          <Footer />
                        </div>
                      </AppConfigContext.Provider>
                    </ChainInfoContext.Provider>
                  </RuntimeContext.Provider>
                </QueryClientProvider>
              )}
            </Await>
          </Suspense>
        )}
      </Await>
    </ErrorBoundary>
  );
};

export default MainLayout;
