package main

import (
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/ledgerwatch/erigon-lib/common"
	"github.com/ledgerwatch/log/v3"
	"github.com/spf13/cobra"

	"github.com/wmitsuda/otterscan/cmd/otter/cli"
	mycmds "github.com/wmitsuda/otterscan/cmd/otter/commands"
)

func main() {
	cmd, cfg := cli.RootCommand()
	rootCtx, rootCancel := common.RootContext()
	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		logger := log.New()
		db, borDb, backend, txPool, mining, stateCache, blockReader, ff, agg, err := cli.RemoteServices(ctx, *cfg, logger, rootCancel)
		if err != nil {
			log.Error("Could not connect to DB", "err", err)
			return nil
		}
		defer db.Close()
		if borDb != nil {
			defer borDb.Close()
		}
		r := chi.NewRouter()
		// route the server

		if !cfg.OtsServerDisable {
			RouteServer(r, *cfg)
		}

		apiList := mycmds.APIList(db, borDb, backend, txPool, mining, ff, stateCache, blockReader, agg, *cfg)
		if err := cli.StartRpcServer(ctx, r, *cfg, apiList); err != nil {
			log.Error(err.Error())
			return nil
		}
		return nil
	}
	if err := cmd.ExecuteContext(rootCtx); err != nil {
		log.Error(err.Error())
		os.Exit(1)
	}
}
