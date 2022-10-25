package main

import (
	"encoding/json"
	"net/http"
	"strings"

	"gfx.cafe/open/4bytes/sigs"
	"gfx.cafe/open/4bytes/topics"
	"gfx.cafe/open/4bytes/triemap"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/wmitsuda/otterscan/cmd/otter/cli/httpcfg"
)

func RouteServer(r chi.Router, cfg httpcfg.HttpCfg) {
	r.Group(func(r chi.Router) {
		filesDir := http.Dir(cfg.OtsStaticDir)
		r.Use(middleware.Logger)
		r.Use(middleware.Recoverer)
		r.HandleFunc("/signatures/{hash}", triemap.HttpHandler(sigs.Both))
		r.HandleFunc("/topic0/{hash}", triemap.HttpHandler(topics.Both))
		r.HandleFunc("/config.json", func(w http.ResponseWriter, r *http.Request) {
			json.NewEncoder(w).Encode(map[string]any{
				"erigonURL":       cfg.OtsRpcDaemonUrl,
				"beaconAPI":       cfg.OtsBeaconApiUrl,
				"assetsURLPrefix": cfg.OtsExternalAssetUrl,
			})
		})
		FileServer(r, "/", filesDir)
	})
}

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}
	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"
	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
