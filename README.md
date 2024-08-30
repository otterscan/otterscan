# Otterscan

An open-source, fast, local, laptop-friendly Ethereum block explorer.

https://user-images.githubusercontent.com/28685/124196700-4fe71200-daa3-11eb-912c-b66494fe4b23.mov

## Documentation

> 💡 For install instructions and a lot more, please take a look at our official documentation: [The Otterscan Book](https://docs.otterscan.io/)!

## What?

This is an Ethereum block explorer designed to be run locally with an archive node companion, [Erigon](https://github.com/erigontech/erigon).

This approach brings many advantages, as follows.

### Privacy

You are querying your own node, so you are not sending your IP address or queries to an external, third-party node.

### Fast

Since you are querying your local archive node, everything is fast. No network roundtrips are necessary.

### Actually, very fast

This software was designed to be a companion of Erigon, a blazingly fast archive node.

### Really, it is even faster

The standard web3 JSON-RPC methods are quite verbose and generic requiring many calls to gather many pieces of information at client side.

We've implemented some custom methods at the client level, so less information needs to be JSON-marshalled and transmitted over the network.

## Why?

Current offerings are either closed source or lack many features the most famous Ethereum block explorer has, or simply have high requirements like having an archive node + additional indexers.

Otterscan requires only a mainline Erigon execution node and Otterscan itself (a simple React app), which makes it a laptop-friendly block explorer.

## Why the name?

3 reasons:

- It is heavily based on Erigon, whose mascot is an otter (Erigon, the otter), think about an otter scanning your transactions inside blocks.
- It is an homage to the most popular Ethereum block explorer.
- The author loves wordplays and bad puns.

## Kudos (in no particular order)

We make use of open-source software and integrate many public data sources, mainly:

To the [Geth](https://geth.ethereum.org/) team whose code Erigon is based on.

To the [Erigon](https://github.com/ledgerwatch/erigon) team that made it possible for regular humans to run an archive node on a retail laptop. Also, they have been very helpful explaining Erigon's internals which made the Otterscan modifications possible.

To the [Test in Prod](https://www.testinprod.io/) team that made OP-Erigon. Their effort made it possible to run Otterscan against any Optimism Superchain.

To the [mdbx](https://github.com/erthink/libmdbx) team which created the blazingly fast database that empowers Erigon.

To [Trust Wallet](https://github.com/trustwallet/assets) who sponsors and makes available their icons under a permissive license.

To the owners of the [4bytes repository](https://github.com/ethereum-lists/4bytes) that we import and use to translate method selectors to human-friendly strings.

To [Sourcify](https://sourcify.dev/), a public, decentralized source code and metadata verification service.

To [Ethers](https://github.com/ethers-io/ethers.js/), which is the client library we used to interact with the Erigon node. It is high-level enough to hide most JSON-RPC particularities but flexible enough to allow for easy interaction with custom methods.

## License

This software itself is MIT licensed and redistributes MIT-compatible dependencies.

The Otterscan API is implemented inside Erigon and follow its own license (LPGL-3).

## Getting in touch

### Erigon Discord server

Our Discord server: https://discord.gg/5xM2q2eqDz

Otterscan also has a community channel under the "ecosystem" section of [Erigon's Discord](https://github.com/erigontech/erigon#erigon-discord-server) (invite should be requested).

### X/Twitter

Official X/Twitter account: ([@otterscan](https://x.com/otterscan)).

Follow the creator on X/Twitter for more updates ([@wmitsuda](https://x.com/wmitsuda)).

### Donation address

If you like this project, feel free to send donations to `otterscan.eth` on any EVM chain (it's an EOA).

We also participate regularly on Gitcoin Grants rounds.
