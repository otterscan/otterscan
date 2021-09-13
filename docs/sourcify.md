# Sourcify

We get the contract source code and metadata from [Sourcify](https://sourcify.dev/).

There are multiple ways to consume their data we support, each one with pros and cons:

## IPNS/IPFS

This is the default integration method, we resolve the public Sourcify IPNS to get the latest known IPFS root hash of their repository.

The downside is that recently verified contracts may not have yet been added to the root hash and republished into IPNS.

It assumes a local IPFS gateway at localhost:8080 to avoid leaking your queries to public gateways.

> This option is actually not working, but it is provided for completeness, follow https://github.com/ethereum/sourcify/issues/495

## Direct HTTP connection to Sourcify's repository

Standard HTTP connection to their repo at https://repo.sourcify.dev/

Fast access to fresh verified data. On the other hand it is less private and centralized.

## Local snapshot

As a midterm solution, we are making available a snapshot docker image of their repository, containing only mainnet full verified contracts.

This would allow you to play with existing contracts up to the snapshot date/time locally, not depending on their service or IPFS connectivity availability.

> It is very likely this run mode will be deprecated in future.

The Sourcify snapshot is provided as a nginx image at: https://hub.docker.com/repository/docker/otterscan/sourcify-snapshot

You can run it with:

```
docker run --rm -d -p 3006:80 --name sourcify-snapshot otterscan/sourcify-snapshot:2021-09
```

Stop it with:

```
docker stop sourcify-snapshot
```
