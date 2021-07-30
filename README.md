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

This software is currently distributed as a docker image.

It depends heavily on a working Erigon installation with Otterscan patches applied, so let's begin with it first.

### Install Erigon

You will need an Erigon executing node (`erigon`). Also you will need Erigon RPC daemon (`rpcdaemon`) with Otterscan patches. Since setting up an Erigon environment itself can take some work, make sure to follow their instructions and have a working archive node before continuing.

My personal experience: at the moment of this writing (~block 12,700,000), setting up an archive node takes over 5-6 days and ~1.3 TB of SSD.

They have weekly stable releases, make sure you are running on of them, not development ones.

### Install Otterscan patches on top of Erigon

Add our forked Erigon git tree as an additional remote and checkout the corresponding branch.

The repository with Otterscan patches is [here](https://github.com/wmitsuda/erigon).

```
git remote add otterscan https://github.com/wmitsuda/erigon.git
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

This is the preferred way to run Otterscan. You can read about other ways [here](docs/other-ways-to-run-otterscan.md).

## Validating the installation (all methods)

You can make sure it is working correctly if the homepage is able to show the latest block/timestamp your Erigon node is at just bellow the search button.

## Kudos

To the [Geth](https://geth.ethereum.org/) team whose code Erigon is based on.

To the [Erigon](https://github.com/ledgerwatch/erigon) team that made it possible for regular humans to run an archive node in a retail laptop. Also, they have been very helpful explaining Erigon's internals which made the modifications Otterscan requires possible.

To the [mdbx](https://github.com/erthink/libmdbx) team which is the blazingly fast database that empowers Erigon.

To [Trust Wallet](https://github.com/trustwallet/assets) who sponsor and make available their icons under a permissive license.

To the owners of the [4bytes repository](https://github.com/ethereum-lists/4bytes) that we import and use to translate the method selectors to human-friendly strings.

To [Ethers](https://github.com/ethers-io/ethers.js/) which is the client library we used to interact with the ETH node. It is high level enough to hide most jsonrpc particularities, but flexible enough to allow easy interaction with custom jsonrpc methods.

## Future

Erigon keeps evolving at a fast pace, with weekly releases, sometimes with (necessary) breaking changes.

This project intends to keep following their progress and mantaining compatibility as the availability of the author permits.

Erigon itself is alpha, so I consider this software is also in alpha state, however it is pretty usable.

Also there is room for many improvements that are not possible in the current centralized, closed source block explorer offerings and the author of this software would like to have.

## Getting in touch

### Erigon Discord server

Otterscan has a community channel under the "ecosystem" section of [Erigon's Discord](https://github.com/ledgerwatch/erigon#erigon-discord-server).

### Twitter

Follow the creator on Twitter for updates ([@wmitsuda](https://twitter.com/wmitsuda)).

### Donation address

If you like this project, feel free to send donations to `otterscan.eth`
