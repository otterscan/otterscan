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
    "ipfs": "https://ipfs.io/ipns/k51qzi5uqu5dll0ocge71eudqnrgnogmbr37gsgl12uubsinphjoknl6bbi41p",
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
