# Beacon chain integration (experimental)

Since _The Merge_, running a consensus layer node (CL) is required alongside the execution layer node (EL).

Like EL has _blocks_ and _transactions_, CL has its own set of data structures. It is possible to read this information from CL through a standardized [Beacon Chain REST API](https://ethereum.github.io/beacon-APIs/).

For merged chains, Otterscan can optionally display CL information.

## Gotchas

There are many CL implementations that you can combine with your EL, hence many possible issues or different behaviors, even in the same implementation depending on how it is configured.

We have been mainly using Lighthouse since it has checkpoint sync and backfilling. It is out-of-scope of this document to review all existing CL implementations.

Let's now describe in more details some issues we noticed.

### Checkpoint vs. genesis sync

Checkpoint sync is a nice feature that allows you to "jump" directly to a finalized slot and have a functional CL node in a matter of minutes.

However doing that you won't have the historical information, i.e., you won't be able to explore older slots, epochs, etc.

That may not be such a problem if you are only concerned with your current validator balance, for example. Just be aware of that.

The alternative if you want to browse all beacon chain history is to do a genesis sync, but that is very slow on mainnet.

### Backfilling

Some CL implementations (e.g. Lighthouse) have a nice feature called `backfilling`, where you can do a checkpoint sync, have a functional CL node in minutes, but it downloads historical information in background.

That may be a better alternative to genesis sync if you want to have all historical info.

### Some historical operations can be slow on default settings

Let's take as an example the `/eth/v1/validator/duties/proposer/` call that we use to obtain the elected block proposers for a given epoch.

Its main use is to answer the question: for a missed slot, who was the elected validator who missed it?

Well, in Lighthouse, using the default settings, querying an old epoch is very slow: https://github.com/sigp/lighthouse/issues/3770

The alternative is to change data granularity, trading off disk space for speed.

There may be other cases with different trade-offs. Be aware of how your CL implementation works.

## Enabling CL REST API

Instructions for enabling the REST API are dependent on which CL implementation you are using.

It is out-of-scope of this document to explain how it is done since there are many CL implementations. Please check their docs.

We'll provide instructions for Lighthouse as an example since it is the implementation we use in our tests.

But the key points you need to observe are:

- Default port number: that is not standardized, Lighthouse uses `5052`, Prysm uses `3500`, etc.
- Bind the REST webserver to the correct network interface: it is usually set to `localhost` for security reasons, be sure to explicitly bind it to your network interface in order to your browser to reach it. You'll most likely want to bind it to `0.0.0.0`.
- Enable CORS.

### Example instructions for Lighthouse

As of Lighthouse `3.3.0`, the required parameters to make it work with Otterscan are:

```
lighthouse beacon --http --http-address "0.0.0.0" --http-allow-origin '*' <other-regular-settings>
```

## Enabling CL integration in Otterscan

Add the `BEACON_API_URL` environment parameter to your `docker run` command. The URL must point to an exposed CL REST endpoint which is reachable from your browser.

Example:

```
docker run --rm --name otterscan -d -p 5100:80 --env ERIGON_URL="http://my-erigon-node:8545" --env BEACON_API_URL="http://my-lighthouse-node:5052" otterscan/otterscan:<tag>
```
