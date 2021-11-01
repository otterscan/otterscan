import React, { useMemo, useContext } from "react";
import { Route, Switch, useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import NavTab from "./components/NavTab";
import { RuntimeContext } from "./useRuntime";
import { SelectionContext, useSelection } from "./useSelection";
import { useInternalOperations, useTxData } from "./useErigonHooks";
import { useETHUSDOracle } from "./usePriceOracle";
import { useAppConfigContext } from "./useAppConfig";
import { useSourcify, useTransactionDescription } from "./useSourcify";
import {
  transactionDataCollector,
  useResolvedAddresses,
} from "./useResolvedAddresses";

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

type TransactionParams = {
  txhash: string;
};

const Transaction: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams<TransactionParams>();
  const { txhash } = params;

  const txData = useTxData(provider, txhash);
  const addrCollector = useMemo(
    () => transactionDataCollector(txData),
    [txData]
  );
  const resolvedAddresses = useResolvedAddresses(provider, addrCollector);

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
    <StandardFrame>
      <StandardSubtitle>Transaction Details</StandardSubtitle>
      {txData === null && (
        <ContentFrame>
          <div className="py-4 text-sm">
            Transaction <span className="font-hash">{txhash}</span> not found.
          </div>
        </ContentFrame>
      )}
      {txData && (
        <SelectionContext.Provider value={selectionCtx}>
          <Tab.Group>
            <Tab.List className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
              <NavTab href={`/tx/${txhash}`}>Overview</NavTab>
              {txData.confirmedData?.blockNumber !== undefined && (
                <NavTab href={`/tx/${txhash}/logs`}>
                  Logs
                  {txData && ` (${txData.confirmedData?.logs?.length ?? 0})`}
                </NavTab>
              )}
              <NavTab href={`/tx/${txhash}/trace`}>Trace</NavTab>
            </Tab.List>
          </Tab.Group>
          <React.Suspense fallback={null}>
            <Switch>
              <Route path="/tx/:txhash/" exact>
                <Details
                  txData={txData}
                  txDesc={txDesc}
                  userDoc={metadata?.output.userdoc}
                  devDoc={metadata?.output.devdoc}
                  internalOps={internalOps}
                  sendsEthToMiner={sendsEthToMiner}
                  ethUSDPrice={blockETHUSDPrice}
                  resolvedAddresses={resolvedAddresses}
                />
              </Route>
              <Route path="/tx/:txhash/logs/" exact>
                <Logs
                  txData={txData}
                  metadata={metadata}
                  resolvedAddresses={resolvedAddresses}
                />
              </Route>
              <Route path="/tx/:txhash/trace" exact>
                <Trace txData={txData} resolvedAddresses={resolvedAddresses} />
              </Route>
            </Switch>
          </React.Suspense>
        </SelectionContext.Provider>
      )}
    </StandardFrame>
  );
};

export default React.memo(Transaction);
