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
The Otterscan instance should be pointed to an Erigon devnet running on `http://localhost:8545`. You can start an Erigon devnet with this command:
```sh
./erigon --chain=dev --datadir=dev --http.api eth,erigon,trace,ots,ots2 --http.corsdomain "*" --http.vhosts "*" --mine --fakepow
```

(Note: The private key for the funded account can be found with `echo -n "erigon devnet key" | sha256sum`.)

Run the devnet and common end-to-end tests:
```sh
npm run cy:run-devnet
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
