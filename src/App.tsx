import { QueryClientProvider } from "@tanstack/react-query";
import { isAddress } from "ethers";
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
import {
  addressAttributesQuery,
  erc20HoldingsQuery,
  genericTransactionCountQuery,
  genericTransactionListQuery,
  type TransactionSearchType,
} from "./ots2/usePrototypeTransferHooks";
import { PAGE_SIZE } from "./params";
import ProbeErrorHandler from "./ProbeErrorHandler";
import { queryClient } from "./queryClient";
import { loader as searchLoader } from "./Search";
import { getTransactionQuery, searchTransactionsQuery } from "./search/search";
import { ConnectionStatus } from "./types";
import { ChainInfoContext, populateChainInfo } from "./useChainInfo";
import { loadOtterscanConfig, OtterscanConfig } from "./useConfig";
import { getBalanceQuery, getCodeQuery, hasCodeQuery } from "./useErigonHooks";
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
const ProxyContract = lazy(() => import("./execution/address/ProxyContract"));
const ProxyReadContract = lazy(
  () => import("./execution/address/ProxyReadContract"),
);
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

const addressLoader: LoaderFunction = async ({ params }) => {
  runtime.then((rt) => {
    if (isAddress(params.addressOrName)) {
      const query = hasCodeQuery(rt.provider, params.addressOrName, "latest");
      queryClient.prefetchQuery(query);
    }
  });
  return null;
};

const addressTxResultsLoader: LoaderFunction = async ({ params, request }) => {
  if (params.addressOrName !== undefined && isAddress(params.addressOrName)) {
    const address = params.addressOrName;
    runtime.then((rt) => {
      if (
        params.direction === undefined ||
        params.direction === "first" ||
        params.direction === "last"
      ) {
        const searchQuery = searchTransactionsQuery(
          rt.provider,
          address,
          0,
          params.direction === "last" ? "after" : "before",
        );
        queryClient.prefetchQuery(searchQuery);
      } else if (params.direction === "next" || params.direction === "prev") {
        const url = new URL(request.url);
        const txHash = url.searchParams.get("h");
        if (txHash) {
          queryClient
            .fetchQuery(getTransactionQuery(rt.provider, txHash))
            .then((tx) => {
              if (tx !== null) {
                const searchQuery = searchTransactionsQuery(
                  rt.provider,
                  address,
                  tx.blockNumber!,
                  params.direction === "prev" ? "after" : "before",
                );
                queryClient.prefetchQuery(searchQuery);
              }
            });
        }
      }

      const balanceQuery = getBalanceQuery(rt.provider, address);
      queryClient.prefetchQuery(balanceQuery);
    });
  }
  return null;
};

const addressContractLoader: LoaderFunction = async ({ params }) => {
  runtime.then((rt) => {
    if (params.addressOrName && isAddress(params.addressOrName)) {
      const query = getCodeQuery(rt.provider, params.addressOrName, "latest");
      queryClient.prefetchQuery(query);
    }
  });
  return null;
};

const proxyContractLoader: LoaderFunction = async ({ params }) => {
  Promise.all([runtime, config]).then(([rt, cfg]) => {
    if (
      cfg.experimental &&
      params.addressOrName &&
      isAddress(params.addressOrName)
    ) {
      const query = addressAttributesQuery(rt.provider, params.addressOrName);
      queryClient.prefetchQuery(query);
    }
  });
  return null;
};

const addressOts2List: (typeName: TransactionSearchType) => LoaderFunction =
  (typeName: TransactionSearchType) =>
  async ({ params }) => {
    runtime.then((rt) => {
      if (params.addressOrName && isAddress(params.addressOrName)) {
        const countQuery = genericTransactionCountQuery(
          rt.provider,
          typeName,
          params.addressOrName,
        );
        queryClient
          .fetchQuery(countQuery)
          .then((total) => {
            if (total !== undefined && params.addressOrName !== undefined) {
              let pageNumber = 1;
              if (params.p) {
                try {
                  pageNumber = parseInt(params.p);
                } catch (e: any) {}
              }
              const query = genericTransactionListQuery(
                rt.provider,
                typeName,
                params.addressOrName,
                pageNumber,
                PAGE_SIZE,
                total,
              );
              queryClient.prefetchQuery(query);
            }
          })
          .catch((e) => {});
      }
    });
    return null;
  };

const addressTokenHoldings: LoaderFunction = async ({ params }) => {
  runtime.then((rt) => {
    if (isAddress(params.addressOrName)) {
      const query = erc20HoldingsQuery(rt.provider, params.addressOrName);
      queryClient.prefetchQuery(query);
    }
  });
  return null;
};

const Layout: FC = () => {
  // Config + rt map; typings are not available here :(
  const data: any = useLoaderData();

  return (
    // Catch all error boundary
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* wait for config load */}
      <Await resolve={data.config}>
        {(config: OtterscanConfig) => (
          // Wait for runtime building + probing; suspend while probing;
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
                <QueryClientProvider client={queryClient}>
                  <RuntimeContext.Provider value={runtime}>
                    <ChainInfoContext.Provider
                      value={runtime.config!.chainInfo}
                    >
                      <div className="flex h-screen flex-col">
                        <WarningHeader />
                        <Outlet />
                        <Footer />
                      </div>
                    </ChainInfoContext.Provider>
                  </RuntimeContext.Provider>
                </QueryClientProvider>
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
          <Route
            index
            element={<AddressTransactionResults />}
            loader={addressTxResultsLoader}
          />
          <Route
            path="txs/:direction"
            element={<AddressTransactionResults />}
            loader={addressTxResultsLoader}
          />
          {/* Experimental address routes */}
          <Route
            path="erc20"
            element={<AddressERC20Results />}
            loader={addressOts2List("ERC20Transfer")}
          />
          <Route
            path="erc721"
            element={<AddressERC721Results />}
            loader={addressOts2List("ERC721Transfer")}
          />
          <Route
            path="tokens"
            element={<AddressTokens />}
            loader={addressTokenHoldings}
          />
          <Route
            path="withdrawals"
            element={<AddressWithdrawals />}
            loader={addressOts2List("Withdrawals")}
          />
          <Route
            path="blocksRewarded"
            element={<BlocksRewarded />}
            loader={addressOts2List("BlocksRewarded")}
          />
          <Route
            path="contract"
            element={<AddressContract />}
            loader={addressContractLoader}
          />
          <Route path="readContract" element={<AddressReadContract />} />
          <Route
            path="proxyLogicContract"
            element={<ProxyContract />}
            loader={proxyContractLoader}
          />
          <Route
            path="readContractAsProxy"
            element={<ProxyReadContract />}
            loader={proxyContractLoader}
          />
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
