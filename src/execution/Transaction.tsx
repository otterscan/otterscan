import { TabGroup, TabList } from "@headlessui/react";
import { FC, Suspense, lazy, useContext } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import ContentFrame from "../components/ContentFrame";
import NavTab from "../components/NavTab";
import StandardFrame from "../components/StandardFrame";
import StandardSubtitle from "../components/StandardSubtitle";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import { BlockNumberContext } from "../useBlockTagContext";
import { useTxData } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import { SelectedTransactionContext } from "../useSelectedTransaction";
import { usePageTitle } from "../useTitle";

const Details = lazy(() => import("./transaction/Details"));
const Logs = lazy(() => import("./transaction/Logs"));
const Trace = lazy(() => import("./transaction/Trace"));
const StateDiff = lazy(() => import("./transaction/StateDiff"));

const Transaction: FC = () => {
  const { txhash: txHash } = useParams();
  if (txHash === undefined) {
    throw new Error("txhash couldn't be undefined here");
  }

  const { provider } = useContext(RuntimeContext);
  const txData = useTxData(provider, txHash);

  usePageTitle(txData ? `Transaction ${txData.transactionHash}` : undefined);

  return (
    <SelectedTransactionContext.Provider value={txData}>
      <BlockNumberContext.Provider value={txData?.confirmedData?.blockNumber}>
        <StandardFrame>
          <StandardSubtitle>Transaction Details</StandardSubtitle>
          {txData === null && (
            <ContentFrame>
              <div className="py-4 text-sm">
                Transaction <span className="font-hash">{txHash}</span> not
                found.
              </div>
            </ContentFrame>
          )}
          {txData && (
            <StandardSelectionBoundary>
              <TabGroup>
                <TabList className="flex space-x-2 rounded-t-lg border-l border-r border-t bg-white">
                  <NavTab href=".">Overview</NavTab>
                  {txData.confirmedData?.blockNumber !== undefined && (
                    <NavTab href="logs">
                      Logs
                      {` (${txData.confirmedData?.logs?.length ?? 0})`}
                    </NavTab>
                  )}
                  <NavTab href="trace">Trace</NavTab>
                  <NavTab href="statediff">State Diff</NavTab>
                </TabList>
              </TabGroup>
              <Suspense fallback={null}>
                <Routes>
                  <Route index element={<Details txData={txData} />} />
                  <Route
                    path="logs"
                    element={<Logs logs={txData.confirmedData?.logs} />}
                  />
                  <Route path="trace" element={<Trace txData={txData} />} />
                  <Route
                    path="statediff"
                    element={<StateDiff txData={txData} />}
                  />
                </Routes>
              </Suspense>
            </StandardSelectionBoundary>
          )}
        </StandardFrame>
      </BlockNumberContext.Provider>
    </SelectedTransactionContext.Provider>
  );
};

export default Transaction;
