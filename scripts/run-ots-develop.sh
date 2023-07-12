#!/usr/bin/env bash
set -e

# this script docker-runs the latest develop Otterscan image from Dockerhub
IMAGE_NAME="${OTS_IMAGE:-otterscan/otterscan:develop}"
PULL="${PULL:-always}"
docker run --rm --name otterscan -d -p 5100:80 --pull $PULL --env ERIGON_URL="$1" --env BEACON_API_URL="$2" $IMAGE_NAME

echo "Using EL JSON-RPC API at: $1"
echo "Using CL REST API at: $2"
echo "Otterscan is running; stop it with: docker stop otterscan"
