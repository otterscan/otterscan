import React, { Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import WarningHeader from "./WarningHeader";
import Home from "./Home";
import Search from "./Search";
import Title from "./Title";
import ConnectionErrorPanel from "./ConnectionErrorPanel";
import Footer from "./Footer";
import { ConnectionStatus } from "./types";
import { RuntimeContext, useRuntime } from "./useRuntime";

const Block = React.lazy(() => import("./Block"));
const BlockTransactions = React.lazy(() => import("./BlockTransactions"));
const AddressTransactions = React.lazy(() => import("./AddressTransactions"));
const Transaction = React.lazy(() => import("./Transaction"));

const App = () => {
  const runtime = useRuntime();

  return (
    <Suspense fallback={<>LOADING</>}>
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
              <Switch>
                <Route path="/" exact>
                  <Home />
                </Route>
                <Route path="/search" exact>
                  <Search />
                </Route>
                <Route>
                  <div className="mb-auto">
                    <Title />
                    <Route path="/block/:blockNumberOrHash" exact>
                      <Block />
                    </Route>
                    <Route path="/block/:blockNumber/txs" exact>
                      <BlockTransactions />
                    </Route>
                    <Route path="/tx/:txhash">
                      <Transaction />
                    </Route>
                    <Route path="/address/:addressOrName/:direction?">
                      <AddressTransactions />
                    </Route>
                  </div>
                </Route>
              </Switch>
            </Router>
            <Footer />
          </div>
        </RuntimeContext.Provider>
      )}
    </Suspense>
  );
};

export default React.memo(App);
