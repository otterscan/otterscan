#!/bin/sh
PARAMS=$(echo "{\"erigonURL\": \"$ERIGON_URL\"}" | jq -aRs .)
echo $PARAMS > /usr/share/nginx/html/config.json
nginx -g "daemon off;"
