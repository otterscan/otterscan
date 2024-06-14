# Configuration options

There are multiple ways to configure Otterscan base settings, depending on how you want to run it.

## Static hardcoded node/chain ID

Define a `VITE_CONFIG_JSON` environment variable containing a JSON string with the entire config.

### Development

During development time, define that variable inside a `.env.development.local` file and vite will use those settings automatically.

That file should be ignored by `.gitignore` and must not be pushed into version control.

Example `.env.development.local` file:

```
VITE_CONFIG_JSON='
{
  "erigonURL": "http://your-erigon-node-ip:8545",
  "beaconAPI": "http://your-beacon-node-ip:5052",
  "assetsURLPrefix": "http://localhost:5175",
  "experimentalFixedChainId": 11155111,
  "chainInfo": {
    "name": "Sepolia Testnet",
    "faucets": [],
    "nativeCurrency": {
      "name": "Sepolia Ether",
      "symbol": "SEPETH",
      "decimals": 18
    }
  },
  "sourcifySources": {
    "ipfs": "https://ipfs.io/ipns/repo.sourcify.dev",
    "central_server": "https://repo.sourcify.dev"
  }
}
'
```

### Production

On production environment, that variable __needs__ to be defined at build time, otherwise it has no effect; in that case, the node/chain config will be static.

That way the config won't need to be fetched from server (1 less network call on page load), that's the recommended setting for controlled hosted environments where you control the node your users will connect to.

## Fetch config from server

If you don't specify a `VITE_CONFIG_JSON` variable, the dapp will fetch a `<your-domain>/config.json` file on page load.

That file can be overwritten on server-side and changes will be reflected when users refresh the page.

You are free to define the best way to do that depending on how you package your Otterscan distribution.

For reference, our official Docker image accepts initialization parameters that overwrite that file on container initialization.

## Customization

Some components in the user interface can be customized in the config under the `branding` key:

```json
{
  "branding": {
    "siteName": "Otterscan",
    "networkTitle": "Holesky Testnet",
    "hideAnnouncements": false
  }
}
```

* `siteName`: Sets the name displayed on the home page, header, and page titles.
* `networkTitle`: If set, adds an additional name to page titles.
* `hideAnnouncements`: If set to true, hides new feature announcements from the home page.

### Logo

To replace the default Otterscan logo with your own, simply replace `src/otter.png` with a different PNG image. Rebuild Otterscan for the change to take effect.

### Chain information

By default, Otterscan recognizes several chains, including the Ethereum mainnet and several Ethereum test networks. For other chains, specify either (1) a `chainInfo` key in the Otterscan config, or (2) create a JSON file accessible at `{assetsURLPrefix}/chains/eip155-{chainId}.json`. In both cases, use the [ethereum-lists](https://github.com/ethereum-lists/chains) structure to describe the properties of the chain:

* `name`: The full name of the network, such as "Ethereum Mainnet".
* `faucets`: A list of faucet URLs which are accessible at the `/faucets` endpoint and navigable from address pages. The special string `${ADDRESS}` can be included in the URL and will be replaced with the address the user navigated from.
* `nativeCurrency`: Describes the native currency of the chain; this is analogous to ETH on the Ethereum mainnet.
  * `name`: Full name of the native currency, e.g. "Ether".
  * `symbol`: Few-character symbol used in trading, e.g. "ETH".
  * `decimals`: Number of decimals; usually 18.

Example:
```json
{
  "name": "Sepolia Testnet",
  "faucets": [],
  "nativeCurrency": {
    "name": "Sepolia Ether",
    "symbol": "sepETH",
    "decimals": 18
  }
}
```

### Token price oracles

Otterscan makes use of on-chain [Chainlink data feeds](https://docs.chain.link/data-feeds/price-feeds) for fetching historical price data from Chainlink smart contracts compatible with the [AggregatorV3 interface](https://docs.chain.link/data-feeds/api-reference) which act as price oracles. The native token price is fetched from a Chainlink data feed smart contract. The Ethereum mainnet has a registry which Otterscan uses to look up token prices for supported tokens. On other chains, and for tokens not in the registry, Otterscan can estimate a token's price using information from on-chain decentralized exchanges.

**NOTE:** The prices estimated from on-chain decentralized exchanges can be manipulated, especially when tokens have low liquidity or are unable to be traded normally. This price estimation feature returns "best guess" prices; Otterscan certainly cannot guarantee that all tokens with an estimated price have a liquid market or that the prices shown are accurate.

To configure Otterscan's price oracle usage, configure the `priceOracleInfo` key in the config:
* `nativeTokenPrice`: **Required for showing price data.** Shows the native token price at the top of the page.
  * `ethUSDOracleAddress`: AggregatorV3-compatible smart contract that returns the price of the native token in USD. If Chainlink does not support your chain, you may consider deploying a smart contract which implements the AggregatorV3 interface yet derives price data from on-chain sources.
  * `ethUSDOracleDecimals`: Number of decimals used by the oracle smart contract.

You may also include the following in `priceOracleInfo` to let Otterscan estimate token prices from on-chain decentralized exchanges. Note that a native price token oracle is required.
* `wrappedEthAddress`: The address of the wrapped native token contract, which should match the WETH variable in Uniswap router contracts. This is used to estimate the price of tokens which have at least one Uniswap pool paired with the wrapped native token. Required for Uniswap price sources.
* `uniswapV2`: If configured, uses UniswapV2 pairs as sources of price information.
  * `factoryAddress`: The UniswapV2 factory address.
* `uniswapV3`: If configured, uses UniswapV3 pools as sources of price information. Pools at the 0.01%, 0.05%, 0.3%, and 1% price tiers are queried.
  * `factoryAddress`: The UniswapV3 factory address.

Example for Ethereum mainnet:
```json
{
  "priceOracleInfo": {
    "nativeTokenPrice": {
      "ethUSDOracleAddress": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "ethUSDOracleDecimals": 8
    },
    "wrappedEthAddress": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "uniswapV2": {
      "factoryAddress": "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    },
    "uniswapV3": {
      "factoryAddress": "0x1F98431c8aD98523631AE4a59f267346ea31F984"
    }
  }
}
```

### Optimism-specific

For chains which follow the OP Stack, configure the `opChainSettings` key in the config:
* `l1ExplorerURL`: The root URL of a block explorer for the layer-1 of this chain, without a trailing forward slash. This appears on block pages in the "L1 Epoch" row.

Example for OP Sepolia:
```json
{
  "opChainSettings": {
    "l1ExplorerURL": "https://sepolia.otterscan.io"
  }
}
```
