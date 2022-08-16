import React, { useContext } from "react";
import { useParams, Route, Routes } from "react-router-dom";
import { Tab } from "@headlessui/react";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import NavTab from "./components/NavTab";
import { RuntimeContext } from "./useRuntime";
import { useTxData } from "./useErigonHooks";
import { SelectionContext, useSelection } from "./useSelection";
import { SelectedTransactionContext } from "./useSelectedTransaction";
import { BlockNumberContext } from "./useBlockTagContext";

const Details = React.lazy(() => import("./transaction/Details"));
const Logs = React.lazy(() => import("./transaction/Logs"));
const Trace = React.lazy(() => import("./transaction/Trace"));

const Transaction: React.FC = () => {
  const { txhash: txHash } = useParams();
  if (txHash === undefined) {
    throw new Error("txhash couldn't be undefined here");
  }

  const { provider } = useContext(RuntimeContext);
  const txData = useTxData(provider, txHash);
  const selectionCtx = useSelection();

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
            <SelectionContext.Provider value={selectionCtx}>
              <Tab.Group>
                <Tab.List className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
                  <NavTab href=".">Overview</NavTab>
                  {txData.confirmedData?.blockNumber !== undefined && (
                    <NavTab href="logs">
                      Logs
                      {txData &&
                        ` (${txData.confirmedData?.logs?.length ?? 0})`}
                    </NavTab>
                  )}
                  <NavTab href="trace">Trace</NavTab>
                </Tab.List>
              </Tab.Group>
              <React.Suspense fallback={null}>
                <Routes>
                  <Route index element={<Details txData={txData} />} />
                  <Route path="logs" element={<Logs txData={txData} />} />
                  <Route path="trace" element={<Trace txData={txData} />} />
                </Routes>
              </React.Suspense>
            </SelectionContext.Provider>
          )}
        </StandardFrame>
      </BlockNumberContext.Provider>
    </SelectedTransactionContext.Provider>
  );
};

export default Transaction;
