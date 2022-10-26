package main

import (
	"encoding/json"
	"net/http"
	"os"

	"gfx.cafe/open/4bytes/sigs"
	"gfx.cafe/open/4bytes/topics"
	"gfx.cafe/open/4bytes/triemap"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/ledgerwatch/erigon/common/debug"
	"github.com/wmitsuda/otterscan/cmd/otter/cli/httpcfg"
	"github.com/wmitsuda/otterscan/lib/resources"
)

func RouteServer(r chi.Router, cfg httpcfg.HttpCfg) {
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// host the apis
	r.HandleFunc("/signatures/{hash}", triemap.HttpHandler(sigs.Both))
	r.HandleFunc("/topic0/{hash}", triemap.HttpHandler(topics.Both))
	r.Handle("/chains/{chainId}", http.FileServer(resources.ChainsServer))
	r.Handle("/tokens/{chainId}/{address}/logo.png", http.FileServer(resources.AssetsServer))
	r.HandleFunc("/memstats", func(w http.ResponseWriter, r *http.Request) {
		debug.PrintMemStats(false)
	})
	r.HandleFunc("/config.json", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]any{
			"erigonURL":       cfg.OtsRpcDaemonUrl,
			"beaconAPI":       cfg.OtsBeaconApiUrl,
			"assetsURLPrefix": cfg.OtsAssetUrl,
		})
	})

	// host the static site. (dist)
	fileServer := http.FileServer(http.Dir(cfg.OtsStaticDir))
	r.Handle("/*", http.StripPrefix("/", fileServer))
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		if _, err := os.Stat(cfg.OtsStaticDir + r.RequestURI); os.IsNotExist(err) {
			http.StripPrefix(r.RequestURI, fileServer).ServeHTTP(w, r)
		} else {
			fileServer.ServeHTTP(w, r)
		}
	})
}
