# Install instructions

This software is currently distributed as a docker image.

It depends heavily on a working Erigon installation with Otterscan patches applied, so let's begin with it first.

## Install Erigon

You will need an Erigon executing node (`erigon`) with Otterscan patches. Since setting up an Erigon environment itself can take some work, make sure to follow their instructions and have a working archive node before continuing.

My personal experience: at the moment of this writing (~block 15,000,000), setting up an archive node takes over 3-7 days (depending on your hardware) and ~1.6 TB of SSD.

They have weekly alpha releases, make sure you are running one of them, not development ones.

## Install Otterscan-patched erigon

We rely on custom JSON-RPC APIs which are not available in a standard ETH node. We keep a separated repository containing an Erigon fork here: https://github.com/wmitsuda/erigon.

Please follow the instructions in the repository `README` and replace the original Erigon `erigon` with our patched one.

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

You can optionally enable displaying extra info from the beacon chain by providing the public URL of your beacon node API.

Enabling the beacon chain API depends on which CL implementation you are using.

> As an example, for Prysm you need to enable CORS and possibly bind the address to the correct network interface with `--grpc-gateway-host="0.0.0.0" --grpc-gateway-corsdomain='*'` and by default it binds it to the port 3500.

When starting the Otterscan process via Docker, you need to add an extra env variable called `BEACON_API_URL` pointing to your beacon node API URL.

Prysm example:

```
docker run --rm -p 5100:80 --name otterscan -d --env BEACON_API_URL="<your-beacon-node-api-url>" otterscan/otterscan:<versiontag>
```

## Validating the installation (all methods)

You can make sure it is working correctly if the homepage is able to show the latest block/timestamp your Erigon node is at just bellow the search button.
