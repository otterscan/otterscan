import { FC, lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Await,
  createBrowserRouter,
  createRoutesFromElements,
  defer,
  LoaderFunction,
  Outlet,
  Route,
  RouterProvider,
  useLoaderData,
} from "react-router-dom";
import ErrorFallback from "./components/ErrorFallback";
import ConnectionErrorPanel from "./ConnectionErrorPanel";
import Footer from "./Footer";
import Home from "./Home";
import Main from "./Main";
import ProbeErrorHandler from "./ProbeErrorHandler";
import { loader as searchLoader } from "./Search";
import { ConnectionStatus } from "./types";
import { ChainInfoContext, populateChainInfo } from "./useChainInfo";
import { loadOtterscanConfig, OtterscanConfig } from "./useConfig";
import { createRuntime, RuntimeContext } from "./useRuntime";
import WarningHeader from "./WarningHeader";

const Block = lazy(() => import("./execution/Block"));
const BlockTransactions = lazy(() => import("./execution/BlockTransactions"));
const BlockTransactionByIndex = lazy(
  () => import("./execution/block/BlockTransactionByIndex"),
);
const Address = lazy(() => import("./execution/Address"));
const AddressTransactionResults = lazy(
  () => import("./execution/address/AddressTransactionResults"),
);
const AddressContract = lazy(
  () => import("./execution/address/AddressContract"),
);
const AddressReadContract = lazy(
  () => import("./execution/address/AddressReadContract"),
);
const AddressERC20Results = lazy(
  () => import("./execution/address/AddressERC20Results"),
);
const AddressERC721Results = lazy(
  () => import("./execution/address/AddressERC721Results"),
);
const AddressTokens = lazy(() => import("./execution/address/AddressTokens"));
const AddressWithdrawals = lazy(
  () => import("./execution/address/AddressWithdrawals"),
);
const BlocksRewarded = lazy(() => import("./execution/address/BlocksRewarded"));
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

const config = loadOtterscanConfig();

const runtime = populateChainInfo(createRuntime(config));

/**
 * Triggers both config loading and runtime probing/building in parallel.
 *
 * Makes config available in a separate data variable in order to show
 * progress during probing.
 */
const loader: LoaderFunction = async () => {
  return defer({
    config,
    rt: runtime,
  });
};

const addressLoader: LoaderFunction = async ({ params, request }) => {
  const rt = await runtime;
  return defer({
    hasCode: rt.provider.send("ots_hasCode", [params.addressOrName]),
  });
};

const Layout: FC = () => {
  // Config + rt map; typings are not available here :(
  const data: any = useLoaderData();

  return (
    // Catch all error boundary
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* await for config load */}
      <Await resolve={data.config}>
        {(config: OtterscanConfig) => (
          // Await for runtime building + probing; suspend while probing;
          // don't show probe splash if hardcoded chainId
          <Suspense
            fallback={
              config.experimentalFixedChainId === undefined && (
                <ConnectionErrorPanel
                  connStatus={ConnectionStatus.CONNECTING}
                  nodeURL={config.erigonURL!}
                />
              )
            }
          >
            <Await resolve={data.rt} errorElement={<ProbeErrorHandler />}>
              {(runtime) => (
                // App is healthy from here
                <RuntimeContext.Provider value={runtime}>
                  <ChainInfoContext.Provider value={runtime.config!.chainInfo}>
                    <div className="flex h-screen flex-col">
                      <WarningHeader />
                      <Outlet />
                      <Footer />
                    </div>
                  </ChainInfoContext.Provider>
                </RuntimeContext.Provider>
              )}
            </Await>
          </Suspense>
        )}
      </Await>
    </ErrorBoundary>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} loader={loader}>
      <Route index element={<Home />} />
      <Route path="/search" loader={searchLoader} />
      <Route path="/special/liveBlocks" element={<LiveBlocks />} />
      <Route path="*" element={<Main />}>
        <Route path="block/:blockNumberOrHash" element={<Block />} />
        <Route path="block/:blockNumber/txs" element={<BlockTransactions />} />
        <Route
          path="block/:blockNumberOrHash/tx/:txIndex"
          element={<BlockTransactionByIndex />}
        />
        <Route path="tx/:txhash/*" element={<Transaction />} />
        <Route
          path="address/:addressOrName/"
          element={<Address />}
          loader={addressLoader}
        >
          <Route index element={<AddressTransactionResults />} />
          <Route
            path="txs/:direction"
            element={<AddressTransactionResults />}
          />
          {/* Experimental address routes */}
          <Route path="erc20" element={<AddressERC20Results />} />
          <Route path="erc721" element={<AddressERC721Results />} />
          <Route path="tokens" element={<AddressTokens />} />
          <Route path="withdrawals" element={<AddressWithdrawals />} />
          <Route path="blocksRewarded" element={<BlocksRewarded />} />
          <Route path="contract" element={<AddressContract />} />
          <Route path="readContract" element={<AddressReadContract />} />
          <Route
            path="*"
            element={
              null /* TODO: Replace with address-specific "tab not found" */
            }
          />
        </Route>

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
