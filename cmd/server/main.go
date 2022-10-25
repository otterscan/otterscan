package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"gfx.cafe/open/4bytes/sigs"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	root := "dist"
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	if os.Getenv("ROOTDIR") != "" {
		root = os.Getenv("ROOTDIR")
	}
	if len(os.Args) > 1 {
		if os.Args[1] != "" {
			root = os.Args[1]
		}
	}
	filesDir := http.Dir(root)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.SetHeader("Access-Control-Allow-Origin", "*"))

	r.Handle("/signatures/{hash}", &sigs.HttpServer{})

	FileServer(r, "/", filesDir)

	s := http.Server{
		Addr:    ":" + port,
		Handler: r,
	}
	s.SetKeepAlivesEnabled(false)
	s.ReadHeaderTimeout = 250 * time.Millisecond
	s.MaxHeaderBytes = 8192

	log.Println("static asset server running on " + port)
	// Start the server.
	if err := s.ListenAndServe(); err != nil {
		log.Fatalf("error in ListenAndServe: %v", err)
	}
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
