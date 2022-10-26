package httpcfg

import (
	"github.com/ledgerwatch/erigon/cmd/rpcdaemon/cli/httpcfg"
)

type HttpCfg struct {
	httpcfg.HttpCfg

	DisableRpcDaemon bool

	OtsServerDisable bool

	OtsApiPath      string
	OtsStaticDir    string
	OtsAssetUrl     string
	OtsRpcDaemonUrl string
	OtsBeaconApiUrl string
}
