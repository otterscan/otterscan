#!/usr/bin/env bash
./erigon/build/bin/erigon --chain=dev --datadir=dev --http.api eth,erigon,trace,ots,ots2 --http.corsdomain "*" --http.vhosts "*" --mine --fakepow
