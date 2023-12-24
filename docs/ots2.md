# Otterscan 2.x ALPHA

During the alpha period, running Otterscan 2 requires some opt-in extra steps.

Be sure to have a working Otterscan/Erigon installation first, following the [install instructions](./install.md).

## Clone and build Erigon + OTS2 support

Checkout the `ots2-alpha4` branch from Erigon repository: https://github.com/ledgerwatch/erigon/tree/ots2-alpha4

Build it as usual with `make` command.

## Enable OTS2 indexers inside Erigon

Change Erigon CLI args to:

- Enable `ots2` API namespace in addition to `ots`.
- Add `--experimental.ots2` CLI arg.

For example, if your Erigon start command is:

```
erigon \
        --datadir /mnt/erigon \
        --http \
        --http.api "eth,erigon,ots" \
        --http.corsdomain "*" \
        --http.addr "0.0.0.0" \
        --http.vhosts '*'
```

change it to:

```
erigon \
        --datadir /mnt/erigon \
        --http \
        --http.api "eth,erigon,ots,ots2" \
        --http.corsdomain "*" \
        --http.addr "0.0.0.0" \
        --http.vhosts '*' \
        --experimental.ots2
```

## Enable OTS2 mode in Otterscan

Add the `OTS2=true` env variable when starting the docker container.

For example, if your docker start command is:

```
docker run --rm --name otterscan -d -p 5100:80 --env ERIGON_URL="<erigon-url>" otterscan/otterscan:v2.3.0
```

change it to:

```
docker run --rm --name otterscan -d -p 5100:80 --env ERIGON_URL="<erigon-url>" --env OTS2=true otterscan/otterscan:v2.3.0
```
