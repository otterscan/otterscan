import React, { useMemo, useContext } from "react";
import { Route, Switch, useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import NavTab from "./components/NavTab";
import Details from "./transaction/Details";
import Logs from "./transaction/Logs";
import { RuntimeContext } from "./useRuntime";
import { SelectionContext, useSelection } from "./useSelection";
import { useInternalOperations, useTxData } from "./useErigonHooks";
import { useETHUSDOracle } from "./usePriceOracle";
import { useSourcify, useTransactionDescription } from "./useSourcify";
import { SourcifySource } from "./url";

type TransactionParams = {
  txhash: string;
};

const Transaction: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams<TransactionParams>();
  const { txhash } = params;

  const txData = useTxData(provider, txhash);

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

  const metadata = useSourcify(
    txData?.to,
    provider?.network.chainId,
    SourcifySource.CENTRAL_SERVER // TODO: use dynamic selector
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
            </Tab.List>
          </Tab.Group>
          <Switch>
            <Route path="/tx/:txhash/" exact>
              <Details
                txData={txData}
                txDesc={txDesc}
                internalOps={internalOps}
                sendsEthToMiner={sendsEthToMiner}
                ethUSDPrice={blockETHUSDPrice}
              />
            </Route>
            <Route path="/tx/:txhash/logs/" exact>
              <Logs txData={txData} metadata={metadata} />
            </Route>
          </Switch>
        </SelectionContext.Provider>
      )}
    </StandardFrame>
  );
};

export default React.memo(Transaction);
