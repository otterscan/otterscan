# Install instructions

This software is currently distributed as a docker image.

It depends heavily on a working Erigon installation with Otterscan patches applied, so let's begin with it first.

## Install Erigon

You will need an Erigon executing node (`erigon`). Also you will need Erigon RPC daemon (`rpcdaemon`) with Otterscan patches. Since setting up an Erigon environment itself can take some work, make sure to follow their instructions and have a working archive node before continuing.

My personal experience: at the moment of this writing (~block 14,000,000), setting up an archive node takes over 5-6 days and ~1.7 TB of SSD.

They have weekly stable releases, make sure you are running on of them, not development ones.

## Install Otterscan-patched rpcdaemon

We rely on custom JSON-RPC APIs which are not available in a standard ETH node. We keep a separated repository containing an Erigon fork here: https://github.com/wmitsuda/erigon.

Please follow the instructions in the repository `README` and replace the original Erigon `rpcdaemon` with our patched one.

## Enable Otterscan namespace on rpcdaemon

When running `rpcdaemon`, make sure to enable the `erigon`, `ots`, `eth` APIs in addition to whatever cli options you are using to start `rpcdaemon`.

`ots` stands for Otterscan and it is the namespace we use for our own custom APIs.

```
<path-to-rpcdaemon-binary>/rpcdaemon --http.api "eth,erigon,ots,<your-other-apis>" --private.api.addr 127.0.0.1:9090 --datadir <erigon-datadir> --http.corsdomain "*"
```

Be sure to include both `--private.api.addr` and `--datadir` parameter so you run it in dual mode, otherwise the performance will be much worse.

Also pay attention to the `--http.corsdomain` parameter, CORS is **required** for the browser to call the node directly.

Now you should have an Erigon node with Otterscan JSON-RPC APIs enabled, running in dual mode with CORS enabled.

## Run Otterscan docker image from Docker Hub

The Otterscan official repo on Docker Hub is [here](https://hub.docker.com/orgs/otterscan/repositories).

```
docker run --rm -p 5000:80 --name otterscan -d otterscan/otterscan:<versiontag>
```

This will download the Otterscan image from Docker Hub, run it locally using the default parameters, binding it to port 5000 (see the `-p` docker run parameter).

To stop Otterscan service, run:

```
docker stop otterscan
```

By default it assumes your Erigon node is at `http://127.0.0.1:8545`. You can override the URL by setting the `ERIGON_URL` env variable on `docker run`:

```
docker run --rm -p 5000:80 --name otterscan -d --env ERIGON_URL="<your-erigon-node-url>" otterscan/otterscan:<versiontag>
```

This is the preferred way to run Otterscan. You can read about other ways [here](./other-ways-to-run-otterscan.md).

## Validating the installation (all methods)

You can make sure it is working correctly if the homepage is able to show the latest block/timestamp your Erigon node is at just bellow the search button.
