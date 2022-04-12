import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WarningHeader from "./WarningHeader";
import Home from "./Home";
import Main from "./Main";
import ConnectionErrorPanel from "./ConnectionErrorPanel";
import Footer from "./Footer";
import { ConnectionStatus } from "./types";
import { RuntimeContext, useRuntime } from "./useRuntime";
import { ChainInfoContext, useChainInfoFromMetadataFile } from "./useChainInfo";

const Block = React.lazy(
  () => import(/* webpackChunkName: "block", webpackPrefetch: true */ "./Block")
);
const BlockTransactions = React.lazy(
  () =>
    import(
      /* webpackChunkName: "blocktxs", webpackPrefetch: true */ "./BlockTransactions"
    )
);
const Address = React.lazy(
  () =>
    import(/* webpackChunkName: "address", webpackPrefetch: true */ "./Address")
);
const Transaction = React.lazy(
  () =>
    import(/* webpackChunkName: "tx", webpackPrefetch: true */ "./Transaction")
);
const London = React.lazy(
  () => import(/* webpackChunkName: "london" */ "./special/london/London")
);
const Faucets = React.lazy(
  () => import(/* webpackChunkName: "faucets" */ "./Faucets")
);
const PageNotFound = React.lazy(
  () =>
    import(
      /* webpackChunkName: "notfound", webpackPrefetch: true */ "./PageNotFound"
    )
);

const App = () => {
  const runtime = useRuntime();
  const chainInfo = useChainInfoFromMetadataFile(runtime);

  return (
    <Suspense fallback={null}>
      {runtime.connStatus !== ConnectionStatus.CONNECTED ||
      chainInfo === undefined ? (
        <ConnectionErrorPanel
          connStatus={runtime.connStatus}
          config={runtime.config}
        />
      ) : (
        <RuntimeContext.Provider value={runtime}>
          <ChainInfoContext.Provider value={chainInfo}>
            <div className="h-screen flex flex-col">
              <WarningHeader />
              <Router>
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="/special/london" element={<London />} />
                  <Route path="*" element={<Main />}>
                    <Route
                      path="block/:blockNumberOrHash"
                      element={<Block />}
                    />
                    <Route
                      path="block/:blockNumber/txs"
                      element={<BlockTransactions />}
                    />
                    <Route path="tx/:txhash/*" element={<Transaction />} />
                    <Route
                      path="address/:addressOrName/*"
                      element={<Address />}
                    />
                    <Route path="faucets/*" element={<Faucets />} />
                    <Route path="*" element={<PageNotFound />} />
                  </Route>
                </Routes>
              </Router>
              <Footer />
            </div>
          </ChainInfoContext.Provider>
        </RuntimeContext.Provider>
      )}
    </Suspense>
  );
};

export default App;
