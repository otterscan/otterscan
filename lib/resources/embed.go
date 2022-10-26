package resources

import (
	"archive/zip"
	"bytes"
	"embed"
	_ "embed"
	"net/http"

	"github.com/spf13/afero"
	"github.com/spf13/afero/zipfs"
)

//go:embed chains/*.json
var Chains embed.FS

var ChainsServer = http.FS(Chains)

//go:embed tokens.zip
var tokensZip []byte

var AssetsServer = func() http.FileSystem {
	z, _ := zip.NewReader(bytes.NewReader(tokensZip), int64(len(tokensZip)))
	return afero.NewHttpFs(zipfs.New(z))
}()
