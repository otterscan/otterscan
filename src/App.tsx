import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WarningHeader from "./WarningHeader";
import Home from "./Home";
import Main from "./Main";
import ConnectionErrorPanel from "./ConnectionErrorPanel";
import Footer from "./Footer";
import { ConnectionStatus } from "./types";
import { RuntimeContext, useRuntime } from "./useRuntime";

const Block = React.lazy(
  () => import(/* webpackChunkName: "block", webpackPrefetch: true */ "./Block")
);
const BlockTransactions = React.lazy(
  () =>
    import(
      /* webpackChunkName: "blocktxs", webpackPrefetch: true */ "./BlockTransactions"
    )
);
const AddressTransactions = React.lazy(
  () =>
    import(
      /* webpackChunkName: "address", webpackPrefetch: true */ "./AddressTransactions"
    )
);
const Transaction = React.lazy(
  () =>
    import(/* webpackChunkName: "tx", webpackPrefetch: true */ "./Transaction")
);
const London = React.lazy(
  () =>
    import(
      /* webpackChunkName: "london", webpackPrefetch: true */ "./special/london/London"
    )
);

const App = () => {
  const runtime = useRuntime();

  return (
    <Suspense fallback={null}>
      {runtime.connStatus !== ConnectionStatus.CONNECTED ? (
        <ConnectionErrorPanel
          connStatus={runtime.connStatus}
          config={runtime.config}
        />
      ) : (
        <RuntimeContext.Provider value={runtime}>
          <div className="h-screen flex flex-col">
            <WarningHeader />
            <Router>
              <Routes>
                <Route index element={<Home />} />
                <Route path="/special/london" element={<London />} />
                <Route path="*" element={<Main />}>
                  <Route path="block/:blockNumberOrHash" element={<Block />} />
                  <Route
                    path="block/:blockNumber/txs"
                    element={<BlockTransactions />}
                  />
                  <Route path="tx/:txhash/*" element={<Transaction />} />
                  <Route
                    path="address/:addressOrName/*"
                    element={<AddressTransactions />}
                  />
                  <Route path="*" element={<Home />} />
                </Route>
              </Routes>
            </Router>
            <Footer />
          </div>
        </RuntimeContext.Provider>
      )}
    </Suspense>
  );
};

export default App;
