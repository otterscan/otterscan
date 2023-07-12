module github.com/wmitsuda/otterscan

go 1.19

replace github.com/tendermint/tendermint => github.com/bnb-chain/tendermint v0.31.12
replace github.com/wmitsuda/otterscan/lib/resources => ./lib/resources

require (
	gfx.cafe/open/4bytes v0.0.0-20221026030913-1f42cb43f802
	github.com/go-chi/chi/v5 v5.0.7
	github.com/jessevdk/go-flags v1.5.0
	github.com/ledgerwatch/erigon v1.9.7-0.20221025025825-26fdf9169d27
	github.com/spf13/afero v1.9.2
)

require (
	github.com/benesch/cgosymbolizer v0.0.0-20190515212042-bec6fe6e597b // indirect
	github.com/blang/semver v3.5.1+incompatible // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/go-stack/stack v1.8.1 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/google/go-cmp v0.5.8 // indirect
	github.com/ianlancetaylor/cgosymbolizer v0.0.0-20220405231054-a1ae3e4bba26 // indirect
	github.com/klauspost/compress v1.15.11 // indirect
	github.com/ledgerwatch/erigon-lib v0.0.0-20221024025924-48ff56eead80 // indirect
	github.com/ledgerwatch/log/v3 v3.6.0 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.16 // indirect
	github.com/openacid/errors v0.8.1 // indirect
	github.com/openacid/low v0.1.14 // indirect
	github.com/openacid/must v0.1.3 // indirect
	github.com/openacid/slim v0.5.11 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/stretchr/testify v1.8.0 // indirect
	golang.org/x/sys v0.1.0 // indirect
	golang.org/x/text v0.4.0 // indirect
	google.golang.org/protobuf v1.28.1 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
