import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ConnectionErrorPanel from "./ConnectionErrorPanel";
import Footer from "./Footer";
import Home from "./Home";
import Main from "./Main";
import { ConnectionStatus } from "./types";
import { ChainInfoContext, useChainInfoFromMetadataFile } from "./useChainInfo";
import { RuntimeContext, useRuntime } from "./useRuntime";
import WarningHeader from "./WarningHeader";

const Block = lazy(() => import("./execution/Block"));
const BlockTransactions = lazy(() => import("./execution/BlockTransactions"));
const BlockTransactionByIndex = lazy(
  () => import("./execution/block/BlockTransactionByIndex"),
);
const DSBlock = lazy(() => import("./execution/DSBlock"));
const BlockList = lazy(() => import("./execution/BlockList"));
const DSBlockList = lazy(() => import("./execution/DSBlockList"));
const Address = lazy(() => import("./execution/Address"));
const Transaction = lazy(() => import("./execution/Transaction"));
const AllContracts = lazy(() => import("./token/AllContracts"));
const AllERC20 = lazy(() => import("./token/AllERC20"));
const AllERC4626 = lazy(() => import("./token/AllERC4626"));
const AllERC721 = lazy(() => import("./token/AllERC721"));
const AllERC1155 = lazy(() => import("./token/AllERC1155"));
const AllERC1167 = lazy(() => import("./token/AllERC1167"));
const Epoch = lazy(() => import("./consensus/Epoch"));
const Slot = lazy(() => import("./consensus/Slot"));
const Validator = lazy(() => import("./consensus/Validator"));
const London = lazy(() => import("./special/london/London"));
const Faucets = lazy(() => import("./Faucets"));
const PageNotFound = lazy(() => import("./PageNotFound"));


const App = () => {
  const runtime = useRuntime();
  // TODO: fix internal hack
  let chainInfo = useChainInfoFromMetadataFile(runtime);
  if (runtime.config?.chainInfo !== undefined) {
    chainInfo = runtime.config.chainInfo;
  }

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
            <div className="flex h-screen flex-col">
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
                    <Route
                      path="dsblock/:dsBlockNumberOrHash"
                      element={<DSBlock />}
                    />
                    <Route
                      path="blocklist" element={ <BlockList/>}
                    />
                    <Route
                      path="dsblocklist" element={ <DSBlockList/>}
                    />
                    <Route
                      path="block/:blockNumberOrHash/tx/:txIndex"
                      element={<BlockTransactionByIndex />}
                    />
                    <Route path="tx/:txhash/*" element={<Transaction />} />
                    <Route
                      path="address/:uncheckedAddressOrName/*"
                      element={<Address />}
                    />
                    {runtime.config?.experimental && (
                      <>
                        <Route path="contracts/*" element={<AllContracts />} />
                        <Route
                          path="contracts/erc20/*"
                          element={<AllERC20 />}
                        />
                        <Route
                          path="contracts/erc4626/*"
                          element={<AllERC4626 />}
                        />
                        <Route
                          path="contracts/erc721/*"
                          element={<AllERC721 />}
                        />
                        <Route
                          path="contracts/erc1155/*"
                          element={<AllERC1155 />}
                        />
                        <Route
                          path="contracts/erc1167/*"
                          element={<AllERC1167 />}
                        />
                      </>
                    )}
                    <Route path="epoch/:epochNumber/*" element={<Epoch />} />
                    <Route path="slot/:slotNumber/*" element={<Slot />} />
                    <Route
                      path="validator/:validatorIndex/*"
                      element={<Validator />}
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
