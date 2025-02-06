#!/usr/bin/env sh
./erigon/build/bin/erigon \
  --chain=dev \
  --datadir=./erigon/build/bin/dev \
  --http.api eth,erigon,trace,ots,ots2 \
  --http.corsdomain "*" \
  --http.vhosts "*" \
  --mine \
  --fakepow
