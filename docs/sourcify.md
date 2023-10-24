# Sourcify

We get the contract source code and metadata from [Sourcify](https://sourcify.dev/).

## Integration modes

There are multiple ways to consume their data that we support, each one with pros and cons:

### IPFS

This is the default integration method, we resolve the public Sourcify IPNS to get the latest known IPFS root hash of their repository.

The downside is that recently verified contracts may not have yet been added to the root hash and republished into IPNS.

It uses the public gateway at https://ipfs.io by default.

Please see our [ipfs integration docs](./ipfs.md) for more info about how we handle all IPFS integrations and privacy concerns.

### Direct HTTP connection to Sourcify's repository

Standard HTTP connection to their repo at https://repo.sourcify.dev/

Fast access to fresh verified data. On the other hand it is less private and centralized.

### Local snapshot **(deprecated; soon to be removed)**

As a midterm solution, we are making available a snapshot docker image of their repository, containing only mainnet full verified contracts.

This would allow you to play with existing contracts up to the snapshot date/time locally, not depending on their service or IPFS connectivity availability.

The Sourcify snapshot is provided as a nginx image at: https://hub.docker.com/repository/docker/otterscan/sourcify-snapshot

You can run it with:

```
docker run --rm -d -p 3006:80 --name sourcify-snapshot otterscan/sourcify-snapshot:2021-09
```

Stop it with:

```
docker stop sourcify-snapshot
```

## Custom Sourcify integration sources

Rather than using the default `ipfs.io` and `repo.sourcify.dev` sites for accessing Sourcify, you may specify your own Sourcify root URLs in the configuration file by adding the `sourcifySources` key and changing the URLs accordingly:
```json
"sourcifySources": {
  "ipfs": "https://ipfs.io/ipns/repo.sourcify.dev",
  "central_server": "https://repo.sourcify.dev"
}
```

This is useful if you have your own Sourcify repository hosted locally, in which case all of your Otterscan activity will be private.
