package httpcfg

import (
	"github.com/ledgerwatch/erigon/cmd/rpcdaemon/cli/httpcfg"
)

type HttpCfg struct {
	httpcfg.HttpCfg

	DisableRpcDaemon bool

	OtsServerDisable bool

	OtsStaticDir        string
	OtsExternalAssetUrl string
	OtsRpcDaemonUrl     string
	OtsBeaconApiUrl     string
}
