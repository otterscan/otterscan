#!/bin/sh
PARAMS="{\"erigonURL\": $(echo $ERIGON_URL | jq -aR .)}"
echo $PARAMS > /usr/share/nginx/html/config.json
nginx -g "daemon off;"
