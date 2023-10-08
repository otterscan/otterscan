# Install instructions

This software is currently distributed as a docker image.

The only requirement is to have a working Erigon node >= v2.29.0. Make sure it is fully synced before continuing.

## Enable Otterscan namespace on erigon

When running `erigon`, make sure to enable the `erigon`, `ots`, `eth` APIs in addition to whatever cli options you are using to start `erigon`.

`ots` stands for Otterscan and it is the namespace we use for our own custom APIs.

```
<path-to-erigon-binary>/erigon --http.api "eth,erigon,ots,<your-other-apis>" --datadir <erigon-datadir> --http.corsdomain "*"
```

Pay attention to the `--http.corsdomain` parameter, CORS is **required** for the browser to call the node directly.

Now you should have an Erigon node with Otterscan JSON-RPC APIs and CORS enabled.

## Run Otterscan docker image from Docker Hub

The Otterscan official repo on Docker Hub is [here](https://hub.docker.com/orgs/otterscan/repositories).

There is an image tag for each release tag on GitHub.

```
docker run --rm -p 5100:80 --name otterscan -d otterscan/otterscan:<versiontag>
```

This will download the Otterscan image from Docker Hub, run it locally using the default parameters, binding it to port 5100 (see the `-p` docker run parameter).

To stop Otterscan service, run:

```
docker stop otterscan
```

By default it assumes your Erigon node is at `http://127.0.0.1:8545`. You can override the URL by setting the `ERIGON_URL` env variable on `docker run`:

```
docker run --rm -p 5100:80 --name otterscan -d --env ERIGON_URL="<your-erigon-node-url>" otterscan/otterscan:<versiontag>
```

This is the preferred way to run Otterscan. You can read about other ways [here](./other-ways-to-run-otterscan.md).

## (Optional) Enable integration with beacon chain

[Instructions are here](./beacon-chain.md).

## Run Otterscan development image from Docker Hub

The `develop` branch is automatically built and published on Docker Hub.

There is a helper script that always pull the latest build and set the required parameters.

From the repository root:

```
./scripts/run-ots-develop.sh <ERIGON-RPC-URL> <CL-REST-API-URL>
```

It'll start a container under the name `otterscan`.

## Validating the installation (all methods)

You can make sure it is working correctly if the homepage is able to show the latest block/timestamp your Erigon node is at just below the search button.
