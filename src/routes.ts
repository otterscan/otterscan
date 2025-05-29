import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./layouts/main-layout.tsx", [
    index("./Home.tsx"),
    route("search", "./Search.tsx"),
    layout("./Main.tsx", [
      route("block/:blockNumberOrHash", "./execution/Block.tsx"),
      route("block/:blockNumber/txs", "./execution/BlockTransactions.tsx"),
      route(
        "block/:blockNumberOrHash/tx/:txIndex",
        "./execution/block/BlockTransactionByIndex.tsx",
      ),
      route("tx/:txhash", "./layouts/empty-layout.tsx", { id: "tx" }, [
        // "*?" causes Transaction.tsx to override the empty layout in all cases;
        // otherwise, "*" would cause only the empty layout to render at the
        // index
        route("*?", "./execution/Transaction.tsx"),
      ]),
      route("address/:addressOrName/", "./execution/Address.tsx", [
        // Because we use this route component multiple times, we must
        // specify an ID: https://github.com/remix-run/react-router/discussions/11632
        index("./execution/address/AddressTransactionResults.tsx", {
          id: "addressRoot",
        }),
        route(
          "txs/:direction",
          "./execution/address/AddressTransactionResults.tsx",
        ),
        route("erc20", "./execution/address/AddressERC20Results.tsx"),
        route("erc721", "./execution/address/AddressERC721Results.tsx"),
        route("tokens", "./execution/address/AddressTokens.tsx"),
        route("withdrawals", "./execution/address/AddressWithdrawals.tsx"),
        route("blocksRewarded", "./execution/address/BlocksRewarded.tsx"),
        route("contract", "./execution/address/AddressContract.tsx"),
        route("readContract", "./execution/address/AddressReadContract.tsx"),
        route("proxyLogicContract", "./execution/address/ProxyContract.tsx"),
        route(
          "readContractAsProxy",
          "./execution/address/ProxyReadContract.tsx",
        ),
      ]),

      // EXPERIMENTAL ROUTES
      route("contracts/*", "./token/AllContracts.tsx"),
      route("contracts/erc20/*", "./token/AllERC20.tsx"),
      route("contracts/erc4626/*", "./token/AllERC4626.tsx"),
      route("contracts/erc721/*", "./token/AllERC721.tsx"),
      route("contracts/erc1155/*", "./token/AllERC1155.tsx"),
      route("contracts/erc1167/*", "./token/AllERC1167.tsx"),
      // EXPERIMENTAL ROUTES

      route("epoch/:epochNumber", "./consensus/Epoch.tsx"),
      route(
        "slot/:slotNumber",
        "./layouts/empty-layout.tsx",
        {
          id: "slotLayout",
        },
        [
          // To handle sub-routes while we transition
          route("*?", "./consensus/Slot.tsx"),
        ],
      ),
      route(
        "slotByBlockRoot/:blockRoot",
        "./consensus/slot/SlotByBlockRoot.tsx",
      ),
      route(
        "validator/:validatorIndex",
        "./layouts/empty-layout.tsx",
        {
          id: "validatorLayout",
        },
        [
          // To handle sub-routes while we transition
          route("*?", "./consensus/Validator.tsx"),
        ],
      ),
      route("special/liveBlocks", "./special/london/LiveBlocks.tsx"),
      route("faucets", "./Faucets.tsx"),
      route("broadcastTx", "./execution/BroadcastTransactionPage.tsx"),
      route("*?", "./PageNotFound.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
