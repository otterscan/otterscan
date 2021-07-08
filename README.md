# Otterscan

An open-source, fast, local, laptop-friendly Ethereum block explorer.

https://user-images.githubusercontent.com/28685/124196700-4fe71200-daa3-11eb-912c-b66494fe4b23.mov

## What?

This is an Ethereum block explorer designed to be run locally with an archive node companion, more specifically, with [Erigon](https://github.com/ledgerwatch/erigon).

This approach brings many advantages, as follows.

### Privacy

You are querying your own node, so you are not sending your IP address or queries to an external third-party node.

### Fast

Since you are querying your local archive node, everything is fast, no network roundtrips are necessary.

### Actually, very fast

This software was designed to be a companion of Erigon, a blazingly fast archive node.

### Really, it is even faster

The standard web3 jsonrpc methods are quite verbose and generic requiring many calls to gather many pieces of information at client side.

We've implemented some custom methods at rpcdaemon level, less information is needed to be json-marshalled and transmitted over network.

## Alpha warning

This software is in alpha stage, and for sure lots of features, error handling, edge cases are missing.

Be sure to check it often or send patches 😀

## Why?

Current offerings are either closed source or lack many features the most famous Ethereum block explorer has, or simply have high requirements like having an archive node + additional indexers.

Otterscan requires only mainline Erigon executing node, patched Erigon RPC daemon and running Otterscan itself (a simple React app), which makes it a laptop-friendly block explorer.

## Why the name?

3 reasons:

- It is heavily based on Erigon, whose mascot is an otter (Erigon, the otter), think about an otter scanning your transactions inside blocks.
- It is an homage to the most famous and used ethereum block explorer.
- The author loves wordplays and bad puns.

## It looks familiar...

The UI was intentionally made very similar to the most popular Ethereum block explorer so users do not strugle trying to find where the information is.

However, you will see that we made many UI improvements.

## Install instructions

This software is currently available as compile-only form.

It depends heavily on a working Erigon installation with Otterscan patches applied, so let's begin with it first.

### Install Erigon

You will need an Erigon executing node (`erigon`). Also you will need Erigon RPC daemon (`rpcdaemon`) with Otterscan patches. Since setting up an Erigon environment itself can take some work, make sure to follow their instructions and have a working archive node before continuing.

My personal experience: at the moment of this writing (~block 12,700,000), setting up an archive node takes over 5-6 days and ~1.3 TB of SSD.

They have weekly stable releases, make sure you are running on of them, not development ones.

### Install Otterscan patches on top of Erigon

Add our forked Erigon git tree as an additional remote and checkout the corresponding branch.

```
git remote add otterscan git@github.com:wmitsuda/erigon.git
```

Checkout the tag corresponding to the stable version you are running. For each supported Erigon version, there should be a corresponding tag containing Otterscan patches.

For example, if you are running Erigon from `v2021.07.01` tag, checkout the tag `v2021.07.01-otterscan` and rebuild `rpcdaemon`.

We intend to release a compatible rebased version containing our changes every week just after Erigon's weekly release, as time permits.

```
git fetch --all
git checkout <version-tag-otterscan>
```

Build the patched `rpcdaemon` binary.

```
make rpcdaemon
```

Run it paying attention to enable the `erigon`, `ots`, `eth` apis to whatever cli options you are using to start `rpcdaemon`.

`ots` stands for Otterscan and it is the namespace we use for our own custom APIs.

```
./build/bin/rpcdaemon --http.api "eth,erigon,ots,<your-other-apis>" --private.api.addr 127.0.0.1:9090 --datadir <erigon-datadir> --http.corsdomain "*"
```

Be sure to include both `--private.api.addr` and `--datadir` parameter so you run it in dual mode, otherwise the performance will be much worse.

Also pay attention to the `--http.corsdomain` parameter, CORS is required for the browser to call the node directly.

Now you should have an Erigon node with Otterscan jsonrpc APIs enabled, running in dual mode with CORS enabled.

### Run Otterscan docker image from Docker Hub

TODO: publish Otterscan official images as soon as it is validated.

```
docker run --rm -p 5000:80 --name otterscan -d otterscan/otterscan:<versiontag>
```

This will download the Otterscan image from Docker Hub, run it locally using the default parameters, binding it to port 5000 (see the `-p` docker run parameter).

To stop Otterscan service, run:

```
docker stop otterscan
```

By default it assumes your Erigon node is at http://127.0.0.1:8545. You can override the URL by setting the `ERIGON_URL` env variable on `docker run`:

```
docker run --rm -p 5000:80 --name otterscan -d --env ERIGON_URL="<your-erigon-node-url>" otterscan/otterscan:<versiontag>
```

### (Alternative 1) Build Otterscan docker image locally and run it

If you don't want to download from Docker Hub, you can build the docker image from the sources and run it.

If you just want to build the image locally, there is no need to install the development toolchain, just make sure you have a recent working Docker installation.

The entire build process will take place inside the docker multi-stage build.

Clone Otterscan repo and its submodules. Checkout the tag corresponding to your Erigon + Otterscan patches. It uses the same version tag from Erigon + Otterscan repo, i.e., if you built the `v2021.07.01-otterscan`, you should build the `v2021.07.01-otterscan` of Otterscan.

```
git clone --recurse-submodules git@github.com:wmitsuda/otterscan.git
cd otterscan
git checkout <version-tag-otterscan>
docker build -t otterscan -f Dockerfile .
```

This will run the entire build process inside a build container, merge the production build of the React app with the 4bytes and trustwallet assets into the same image format it is published in Docker Hub, but locally under the name `otterscan`.

Then you can start/stop it using the commands:

```
docker run --rm -p 5000:80 --name otterscan -d otterscan
docker stop otterscan
```

### (Alternative 2) Run a development build from the source

First, a brief explanation about the app:

- The app itself is a simple React app which will be run locally and communicates with your Erigon node.
- The app makes use of two sources of external databases for cosmetic reasons:
  - Token icons come from the trustwallet public assets repository.
  - Method names come from the 4bytes database.
- These 2 repositories were cloned as submodules and are made available to the app through separate http services. They are accessed at browser level and are optional, if the service is down the result will be broken icons and default 4bytes method selectors instead of human-readable names.

These instructions are subjected to changes in future for the sake of simplification.

Make sure you have a working node 12/npm installation.

By default, it assumes your Erigon `rpcdaemon` processs is serving requests at http://127.0.0.1:8545. You can customize this URL by specifying the `REACT_APP_ERIGON_URL` environment variable at build time (it needs to be done at build time because the build process generates a static website).

To do that, export the variable before running `npm run build`:

```
export REACT_APP_ERIGON_URL=<rpcdaemon-url>
```

Start serving 4bytes and trustwallet assets at `localhost:3001` using a dockerized nginx:

```
npm run start-assets
```

To stop it, run:

```
npm run stop-assets
```

To run Otterscan development build:

```
npm install
npm start
```

Otterscan should now be running at http://localhost:3000/.

## Validating the installation (all methods)

**You can make sure it is working correctly if the homepage is able to show the latest block/timestamp your Erigon node is at just bellow the search button.**

## Kudos

To the [Geth](https://geth.ethereum.org/) team whose code Erigon is based on.

To the [Erigon](https://github.com/ledgerwatch/erigon) team that made it possible for regular humans to run an archive node in a retail laptop. Also, they have been very helpful explaining Erigon's internals which made the modifications Otterscan requires possible.

To the [mdbx](https://github.com/erthink/libmdbx) team which is the blazingly fast database that empowers Erigon.

To [Trust Wallet](https://github.com/trustwallet/assets) who sponsor and make available their icons under a permissive license.

To the owners of the [4bytes repository](https://github.com/ethereum-lists/4bytes) that we import and use to translate the method selectors to human-friendly strings.

## Future

Erigon keeps evolving at a fast pace, with weekly releases, sometimes with (necessary) breaking changes.

This project intends to keep following their progress and mantaining compatibility as the availability of the author permits.

Erigon itself is alpha, so I consider this software is also in alpha state, however it is pretty usable.

Also there is room for many improvements that are not possible in the current centralized, closed source block explorer offerings and the author of this software would like to have.
