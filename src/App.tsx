import React, { Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import Search from "./Search";
import Title from "./Title";

const Block = React.lazy(() => import("./Block"));
const BlockTransactions = React.lazy(() => import("./BlockTransactions"));
const AddressTransactions = React.lazy(() => import("./AddressTransactions"));
const Transaction = React.lazy(() => import("./Transaction"));

const App = () => (
  <Suspense fallback={<>LOADING</>}>
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/search" exact>
          <Search />
        </Route>
        <Route>
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
          <Route path="/address/:address/:direction?">
            <AddressTransactions />
          </Route>
        </Route>
      </Switch>
    </Router>
  </Suspense>
);

export default React.memo(App);
