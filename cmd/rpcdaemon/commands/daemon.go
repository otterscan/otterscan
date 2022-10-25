package commands

import (
	"github.com/ledgerwatch/erigon-lib/gointerfaces/txpool"
	"github.com/ledgerwatch/erigon-lib/kv"
	"github.com/ledgerwatch/erigon-lib/kv/kvcache"
	libstate "github.com/ledgerwatch/erigon-lib/state"
	"github.com/ledgerwatch/erigon/cmd/rpcdaemon/commands"
	"github.com/ledgerwatch/erigon/rpc"
	"github.com/ledgerwatch/erigon/turbo/rpchelper"
	"github.com/ledgerwatch/erigon/turbo/services"

	"github.com/wmitsuda/otterscan/cmd/rpcdaemon/cli/httpcfg"

	erigonHttpcfg "github.com/ledgerwatch/erigon/cmd/rpcdaemon/cli/httpcfg"
)

// APIList describes the list of available RPC apis
func APIList(db kv.RoDB, borDb kv.RoDB, eth rpchelper.ApiBackend, txPool txpool.TxpoolClient, mining txpool.MiningClient,
	filters *rpchelper.Filters, stateCache kvcache.Cache,
	blockReader services.FullBlockReader, agg *libstate.Aggregator22, cfg httpcfg.HttpCfg) (list []rpc.API) {
	tcfg := erigonHttpcfg.HttpCfg{
		MaxTraces:          cfg.MaxTraces,
		Gascap:             cfg.Gascap,
		TraceCompatibility: cfg.TraceCompatibility,
	}
	baseUtils := NewBaseUtilsApi(filters, stateCache, blockReader, agg, cfg.WithDatadir, cfg.EvmCallTimeout)
	base := commands.NewBaseApi(filters, stateCache, blockReader, agg, cfg.WithDatadir, cfg.EvmCallTimeout)
	ethImpl := commands.NewEthAPI(base, db, eth, txPool, mining, cfg.Gascap)
	erigonImpl := commands.NewErigonAPI(base, db, eth)
	txpoolImpl := commands.NewTxPoolAPI(base, db, txPool)
	netImpl := commands.NewNetAPIImpl(eth)
	debugImpl := commands.NewPrivateDebugAPI(base, db, cfg.Gascap)
	traceImpl := commands.NewTraceAPI(base, db, &tcfg)
	web3Impl := commands.NewWeb3APIImpl(eth)
	dbImpl := commands.NewDBAPIImpl() /* deprecated */
	adminImpl := commands.NewAdminAPI(eth)
	parityImpl := commands.NewParityAPIImpl(db)
	borImpl := commands.NewBorAPI(base, db, borDb) // bor (consensus) specific
	otsImpl := NewOtterscanAPI(baseUtils, db)

	for _, enabledAPI := range cfg.API {
		switch enabledAPI {
		case "eth":
			list = append(list, rpc.API{
				Namespace: "eth",
				Public:    true,
				Service:   commands.EthAPI(ethImpl),
				Version:   "1.0",
			})
		case "debug":
			list = append(list, rpc.API{
				Namespace: "debug",
				Public:    true,
				Service:   commands.PrivateDebugAPI(debugImpl),
				Version:   "1.0",
			})
		case "net":
			list = append(list, rpc.API{
				Namespace: "net",
				Public:    true,
				Service:   commands.NetAPI(netImpl),
				Version:   "1.0",
			})
		case "txpool":
			list = append(list, rpc.API{
				Namespace: "txpool",
				Public:    true,
				Service:   commands.TxPoolAPI(txpoolImpl),
				Version:   "1.0",
			})
		case "web3":
			list = append(list, rpc.API{
				Namespace: "web3",
				Public:    true,
				Service:   commands.Web3API(web3Impl),
				Version:   "1.0",
			})
		case "trace":
			list = append(list, rpc.API{
				Namespace: "trace",
				Public:    true,
				Service:   commands.TraceAPI(traceImpl),
				Version:   "1.0",
			})
		case "db": /* Deprecated */
			list = append(list, rpc.API{
				Namespace: "db",
				Public:    true,
				Service:   commands.DBAPI(dbImpl),
				Version:   "1.0",
			})
		case "erigon":
			list = append(list, rpc.API{
				Namespace: "erigon",
				Public:    true,
				Service:   commands.ErigonAPI(erigonImpl),
				Version:   "1.0",
			})
		case "bor":
			list = append(list, rpc.API{
				Namespace: "bor",
				Public:    true,
				Service:   commands.BorAPI(borImpl),
				Version:   "1.0",
			})
		case "admin":
			list = append(list, rpc.API{
				Namespace: "admin",
				Public:    false,
				Service:   commands.AdminAPI(adminImpl),
				Version:   "1.0",
			})
		case "parity":
			list = append(list, rpc.API{
				Namespace: "parity",
				Public:    false,
				Service:   commands.ParityAPI(parityImpl),
				Version:   "1.0",
			})
		case "ots":
			list = append(list, rpc.API{
				Namespace: "ots",
				Public:    true,
				Service:   OtterscanAPI(otsImpl),
				Version:   "1.0",
			})
		}
	}

	return list
}

func AuthAPIList(db kv.RoDB, eth rpchelper.ApiBackend, txPool txpool.TxpoolClient, mining txpool.MiningClient,
	filters *rpchelper.Filters, stateCache kvcache.Cache, blockReader services.FullBlockReader,
	agg *libstate.Aggregator22,
	cfg httpcfg.HttpCfg) (list []rpc.API) {
	base := commands.NewBaseApi(filters, stateCache, blockReader, agg, cfg.WithDatadir, cfg.EvmCallTimeout)

	ethImpl := commands.NewEthAPI(base, db, eth, txPool, mining, cfg.Gascap)
	engineImpl := commands.NewEngineAPI(base, db, eth)

	list = append(list, rpc.API{
		Namespace: "eth",
		Public:    true,
		Service:   commands.EthAPI(ethImpl),
		Version:   "1.0",
	}, rpc.API{
		Namespace: "engine",
		Public:    true,
		Service:   commands.EngineAPI(engineImpl),
		Version:   "1.0",
	})

	return list
}
