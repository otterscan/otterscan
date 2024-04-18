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

Fast access to fresh verified data. On the other hand, it is centralized and leaks all addresses you visit in Otterscan to the server.

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

## Run a local Sourcify instance on your dev network

### Launch a local chain

Launch an Otterscan-compatible local Ethereum RPC node hosting your development server.

- Erigon:
  - `./erigon --chain=dev --datadir=dev --http.api eth,erigon,trace,ots,ots2 --http.corsdomain "*" --http.vhosts "*" --mine --fakepow`
  - Note: The Erigon devnet only supports a pre-Shanghai (pre-Merge) version of Ethereum. When compiling your contracts, you'll have to set the `evmTarget` to `london` for them to run at all on the devnet.
    - You'll have to create a full-fledged Ethereum test network in Erigon if you want to run a modern version of the EVM.
- Foundry's [Anvil](https://book.getfoundry.sh/reference/anvil/):
  - `anvil`
  - Note: Anvil does not support ots2 RPC methods, so make sure `experimental` is set to `false` in your Otterscan config.

### Sourcify

1. Clone the Sourcify repository:

```shell
git clone https://github.com/ethereum/sourcify.git`
```

2. To add support for your local blockchain, create a JSON file `services/server/src/sourcify-chains.json`:
```json
{
  "1337": {
    "sourcifyName": "Local chain",
    "supported": true,
    "rpc": [
      "http://localhost:8545"
    ]
  }
}
```

You can adjust the chain ID `1337` and the RPC host `http://localhost:8545` as needed. The default chain ID for the Erigon devnet is 1337, and the default for Anvil is 31337.

3. Adjust the repository URL in `ui/.env.development` since for simplicity we aren't using Sourcify's h5ai-nginx file viewer:

```shell
REACT_APP_REPOSITORY_SERVER_URL=http://localhost:5555/repository
```

4. Build all needed Sourcify components, notably the server and the UI:

```shell
npm run build:clean
```

5. Start the Sourcify server:

```shell
NODE_ENV=development npm run server:start
```

6. Start the Sourcify UI:

```shell
npm run ui:start
```

### Otterscan configuration

To use the local Sourcify instance, you need to point to it in Otterscan's configuration file.
In your Otterscan configuration JSON, specify your local Sourcify repository as the Sourcify source:

```
"sourcifySources": {
  "ipfs": "http://localhost:5555/repository",
  "central_server": "http://localhost:5555/repository"
}
```

### Verifying contracts

#### Verifying through the Sourcify UI

You can verify contracts using the Sourcify UI by going to http://localhost:3000/#/verifier in your browser.

#### Verifying with Forge

1. If you deploy using a [Forge script](https://book.getfoundry.sh/reference/forge/forge-script), you should add the following contract verification arguments to the command:

```shell
forge script Deploy.s.sol .... --verify --verifier sourcify --verifier-url http://localhost:5555
```

2. If you want to deploy a contract without a script, you can use `forge create` to create the deployment transaction. Create a folder named `contracts` and put your contract files in there.

Here is how you would deploy a smart contract called `MyContract` with constructor arguments `0x67b1d87101671b127f5f8714789C7192f7ad340e` and `123456`:

```shell
./forge create --verify --verifier sourcify --verifier-url http://localhost:5555/ --interactive --optimize --rpc-url http://localhost:8545/ MyContract --constructor-args 0x67b1d87101671b127f5f8714789C7192f7ad340e 123456
```
