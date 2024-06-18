import { FC, lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
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
const SlotByBlockRoot = lazy(() => import("./consensus/slot/SlotByBlockRoot"));
const Validator = lazy(() => import("./consensus/Validator"));
const LiveBlocks = lazy(() => import("./special/london/LiveBlocks"));
const Faucets = lazy(() => import("./Faucets"));
const PageNotFound = lazy(() => import("./PageNotFound"));
const BroadcastTransactionPage = lazy(
  () => import("./execution/BroadcastTransactionPage"),
);

const Layout: FC = () => {
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
              <Outlet />
              <Footer />
            </div>
          </ChainInfoContext.Provider>
        </RuntimeContext.Provider>
      )}
    </Suspense>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="/special/liveBlocks" element={<LiveBlocks />} />
      <Route path="*" element={<Main />}>
        <Route path="block/:blockNumberOrHash" element={<Block />} />
        <Route path="block/:blockNumber/txs" element={<BlockTransactions />} />
        <Route
          path="block/:blockNumberOrHash/tx/:txIndex"
          element={<BlockTransactionByIndex />}
        />
        <Route path="tx/:txhash/*" element={<Transaction />} />
        <Route path="address/:addressOrName/*" element={<Address />} />

        {/* EXPERIMENTAL ROUTES */}
        <Route path="contracts/*" element={<AllContracts />} />
        <Route path="contracts/erc20/*" element={<AllERC20 />} />
        <Route path="contracts/erc4626/*" element={<AllERC4626 />} />
        <Route path="contracts/erc721/*" element={<AllERC721 />} />
        <Route path="contracts/erc1155/*" element={<AllERC1155 />} />
        <Route path="contracts/erc1167/*" element={<AllERC1167 />} />
        {/* EXPERIMENTAL ROUTES */}

        <Route path="epoch/:epochNumber/*" element={<Epoch />} />
        <Route path="slot/:slotNumber/*" element={<Slot />} />
        <Route
          path="slotByBlockRoot/:blockRoot/*"
          element={<SlotByBlockRoot />}
        />
        <Route path="validator/:validatorIndex/*" element={<Validator />} />
        <Route path="faucets/*" element={<Faucets />} />
        <Route path="broadcastTx" element={<BroadcastTransactionPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Route>,
  ),
);

const App = () => <RouterProvider router={router} />;

export default App;
