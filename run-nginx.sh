#!/bin/sh

# Build a json from container init params
PARAMS=$(jq -n \
  --arg erigonURL "$ERIGON_URL" \
  --arg beaconAPI "$BEACON_API_URL" \
  --arg assetsURLPrefix "" \
  '{
    erigonURL: $erigonURL,
    beaconAPI: $beaconAPI,
    assetsURLPrefix: $assetsURLPrefix
  }')

# Overwrite base image config.json with our own and let nginx do the rest
echo $PARAMS > /usr/share/nginx/html/config.json
nginx -g "daemon off;"
