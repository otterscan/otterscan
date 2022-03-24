import React, { useContext, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { Tab } from "@headlessui/react";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import NavTab from "./components/NavTab";
import { RuntimeContext } from "./useRuntime";
import { useInternalOperations, useTxData } from "./useErigonHooks";
import { SelectionContext, useSelection } from "./useSelection";
import { SelectedTransactionContext } from "./useSelectedTransaction";
import { BlockNumberContext } from "./useBlockTagContext";
import { useETHUSDOracle } from "./usePriceOracle";
import { useAppConfigContext } from "./useAppConfig";
import { useSourcify, useTransactionDescription } from "./sourcify/useSourcify";

const Details = React.lazy(
  () =>
    import(
      /* webpackChunkName: "txdetails", webpackPrefetch: true */
      "./transaction/Details"
    )
);
const Logs = React.lazy(
  () =>
    import(
      /* webpackChunkName: "txlogs", webpackPrefetch: true */ "./transaction/Logs"
    )
);
const Trace = React.lazy(
  () =>
    import(
      /* webpackChunkName: "txtrace", webpackPrefetch: true */ "./transaction/Trace"
    )
);

type TransactionPageContentProps = {
  txHash: string;
};

const TransactionPageContent: React.FC<TransactionPageContentProps> = ({
  txHash,
}) => {
  const { provider } = useContext(RuntimeContext);

  const txData = useTxData(provider, txHash);
  const internalOps = useInternalOperations(provider, txData);
  const sendsEthToMiner = useMemo(() => {
    if (!txData || !internalOps) {
      return false;
    }

    for (const t of internalOps) {
      if (t.to === txData.confirmedData?.miner) {
        return true;
      }
    }
    return false;
  }, [txData, internalOps]);

  const selectionCtx = useSelection();

  const blockETHUSDPrice = useETHUSDOracle(
    provider,
    txData?.confirmedData?.blockNumber
  );

  const { sourcifySource } = useAppConfigContext();
  const metadata = useSourcify(
    txData?.to,
    provider?.network.chainId,
    sourcifySource
  );
  const txDesc = useTransactionDescription(metadata, txData);

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
                  <Route
                    index
                    element={
                      <Details
                        txData={txData}
                        txDesc={txDesc}
                        toMetadata={metadata}
                        userDoc={metadata?.output.userdoc}
                        devDoc={metadata?.output.devdoc}
                        internalOps={internalOps}
                        sendsEthToMiner={sendsEthToMiner}
                        ethUSDPrice={blockETHUSDPrice}
                      />
                    }
                  />
                  <Route
                    path="logs"
                    element={<Logs txData={txData} metadata={metadata} />}
                  />
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

export default TransactionPageContent;
