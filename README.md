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

The UI was intentionally made very similar to the most popular Ethereum block explorer so users do not struggle trying to find where the information is.

However, you will see that we made many UI improvements.

## Public instances

Otterscan is meant to be run on your own environment ([see install instructions below](#install-instructions)).

However, we host some testnet instances as a showcase of our features:

- Sepolia testnet: https://sepolia.otterscan.io/
- Holesky testnet: https://holesky.otterscan.io/

Test-in-Prod, the makers of OP-Erigon, also host instances for Optimism:

- OP-Sepolia testnet: https://otterscan.sepolia.testinprod.io/
- OP-Mainnet: https://otterscan.mainnet.testinprod.io/

## Install instructions

[Here](./docs/install.md).

> **NEW**: if you want to opt-in into testing Otterscan v2 ALPHA features, [follow these instructions](./docs/ots2.md).

## Contract verification

We make use of [Sourcify](https://sourcify.dev/) for displaying contract verification info. More info [here](docs/sourcify.md).

## Otterscan JSON-RPC API extensions

We implemented new JSON-RPC APIs to expose information not available in a standard ETH node. They can be useful for non-Otterscan users and their specification is available [here](./docs/custom-jsonrpc.md).

## Kudos (in no particular order)

We make use of many open-source software and integrate many public datasources, mainly:

To the [Geth](https://geth.ethereum.org/) team whose code Erigon is based on.

To the [Erigon](https://github.com/ledgerwatch/erigon) team that made it possible for regular humans to run an archive node in a retail laptop. Also, they have been very helpful explaining Erigon's internals which made the modifications Otterscan requires possible.

To the [mdbx](https://github.com/erthink/libmdbx) team which is the blazingly fast database that empowers Erigon.

To [Trust Wallet](https://github.com/trustwallet/assets) who sponsors and makes available their icons under a permissive license.

To the owners of the [4bytes repository](https://github.com/ethereum-lists/4bytes) that we import and use to translate the method selectors to human-friendly strings.

To [Sourcify](https://sourcify.dev/), a public decentralized source code and metadata verification service.

To [Ethers](https://github.com/ethers-io/ethers.js/) which is the client library we used to interact with the ETH node. It is high level enough to hide most jsonrpc particularities, but flexible enough to allow easy interaction with custom jsonrpc methods.

## Future

Erigon keeps evolving at a fast pace, with weekly releases, sometimes with (necessary) breaking changes.

This project intends to keep following their progress and maintaining compatibility as the availability of the author permits.

Erigon itself is alpha, so I consider this software is also in alpha state, however it is pretty usable.

Also there is room for many improvements that are not possible in the current centralized, closed source block explorer offerings and the author of this software would like to have.

## Licensing

This software itself is MIT licensed and redistributes MIT-compatible dependencies.

The Otterscan API is implemented inside Erigon and follow its own license (LPGL-3).

## Getting in touch

### Erigon Discord server

Our Discord server: https://discord.gg/5xM2q2eqDz

Otterscan also has a community channel under the "ecosystem" section of [Erigon's Discord](https://github.com/ledgerwatch/erigon#erigon-discord-server) (invite should be requested).

### Twitter

Official Twitter account: ([@otterscan](https://twitter.com/otterscan)).

Follow the creator on Twitter for more updates ([@wmitsuda](https://twitter.com/wmitsuda)).

### Donation address

If you like this project, feel free to send donations to `otterscan.eth` on any EVM chain (it's an EOA).

We also participate regularly on Gitcoin Grants rounds.
