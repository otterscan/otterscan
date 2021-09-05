#!/bin/sh
PARAMS="{\"erigonURL\": $(echo $ERIGON_URL | jq -aR .), \"assetsURLPrefix\": \"\"}"
echo $PARAMS > /usr/share/nginx/html/config.json
nginx -g "daemon off;"
