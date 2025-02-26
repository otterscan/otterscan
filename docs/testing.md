# Running tests

## Unit tests
To run the unit tests with Jest, simply run

```sh
npm run test
```

## End-to-end tests
Otterscan uses Cypress as its end-to-end testing framework. You can run the end-to-end tests locally. First, ensure you are running an Otterscan instance on `http://localhost:5173`. Then you can run one of the following commands:

### Ethereum mainnet
```sh
npm run cy:run-mainnet
```

### Erigon devnet
Running the devnet tests requires a custom Otterscan configuration. You can use this command to start Otterscan with the devnet configuration:
```sh
npm run start-devnet
```
The Otterscan instance should then be pointed to an Erigon devnet running on `http://localhost:8545`. You can start an Erigon devnet with this command:
```sh
./erigon --chain=dev --datadir=dev --http.api eth,erigon,trace,ots,ots2 --http.corsdomain "*" --http.vhosts "*" --mine --fakepow
```

(Note: The private key for the funded account can be found with `echo -n "erigon devnet key" | sha256sum`.)

Use an Otterscan config identical to the one at `cypress/support/devnet-config.json`.

Run the devnet and common end-to-end tests:
```sh
VITE_CONFIG_JSON=$(cat cypress/support/devnet-config.json) npm run start
CYPRESS_DEVNET_SOURCIFY_SOURCE=http://localhost:7077 npm run cy:run-devnet
```

On Anvil:
```sh
anvil --chain-id 1337
VITE_CONFIG_JSON=$(cat cypress/support/devnet-config.json) npm run start
CYPRESS_DEVNET_ACCOUNT_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 CYPRESS_DEVNET_SOURCIFY_SOURCE=http://localhost:7077 npm run cy:run-devnet
```

## Running GitHub Actions workflows locally
Otterscan uses GitHub Actions as its CI platform and runs several jobs when pull requests are opened or commits are made to the `develop` and `main` branches.

You can test these locally using [act](https://github.com/nektos/act) with the following command:
```sh
# Ethereum Mainnet Erigon RPC URL
E2E_ERIGON_URL=
# Cypress Cloud record key, if you have one
E2E_CYPRESS_RECORD_KEY=

act --container-architecture linux/amd64 pull_request -s E2E_ERIGON_URL=$E2E_ERIGON_URL -s E2E_CYPRESS_RECORD_KEY=$E2E_CYPRESS_RECORD_KEY --artifact-server-path /tmp/artifacts
```

Screenshots of failed tests will be "uploaded" to `/tmp/artifacts`.
