#!/usr/bin/env bash
set -e

# this script docker-runs the latest develop Otterscan image from Dockerhub
docker run --rm --name otterscan -d -p 5100:80 --pull always --env ERIGON_URL="$1" --env BEACON_API_URL="$2" otterscan/otterscan:develop

echo "Using EL JSON-RPC API at: $1"
echo "Using CL REST API at: $2"
echo "Otterscan is running; stop it with: docker stop otterscan"

