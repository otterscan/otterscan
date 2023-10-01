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
    "network": "",
    "faucets": [],
    "nativeCurrency": {
      "name": "Sepolia Ether",
      "symbol": "SEPETH",
      "decimals": 18
    }
  }
}
'
```

### Production

On production environment, that variable __needs__ to be defined at build time, otherwise it has no effect; in that case, the node/chain config will be static.

That way the config won't need to be fetched from server (1 less network call on page load), that's the recommend setting for controlled hosted environments where you control the node your users will connect to.

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
    "siteName": "Otterscan"
  }
}
```

* `siteName`: Sets the name displayed on the home page, header, and page titles.
