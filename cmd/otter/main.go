package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jessevdk/go-flags"
)

type config struct {
	OtsPort         int    `short:"p" long:"port" default:"3333"`
	OtsApiPath      string `long:"api_path" default:"/"`
	OtsStaticDir    string `long:"static_dir" default:"dist"`
	OtsAssetUrl     string `long:"assert_url" default:""`
	OtsRpcDaemonUrl string `long:"rpc_daemon_url" default:"https://brilliant.staging.gfx.town"`
	OtsBeaconApiUrl string `long:"beacon_api_url" default:"" `
}

var Conf config

var parser = flags.NewParser(&Conf, flags.Default)

func main() {

	parser.Parse()
	r := chi.NewRouter()
	// route the server
	RouteServer(r, Conf)
	log.Printf("Running with config: %+v", Conf)
	err := http.ListenAndServe(fmt.Sprintf(":%d", Conf.OtsPort), r)
	if err != nil {
		log.Println(err)
	}
}
