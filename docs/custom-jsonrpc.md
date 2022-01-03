# Otterscan JSON-RPC API extensions

The [standard Ethereum JSON-RPC APIs](https://ethereum.org/en/developers/docs/apis/json-rpc/) are very limitting and in some cases non-performant for what you can do with an archive node.

There is plenty of useful data that can be extracted and we implemented some extra RPC methods for them.

They are all used by Otterscan, but we are documenting them here so others can try it, give feedback and eventually get it merged upstream if they are generalized enough.

We take an incremental approach when design the APIs, so there may be some methods very specific to Otterscan use cases, others that look more generic.

## Why don't you use _Some Product XXX_ for Otterscan? And why shouldn't I?

If you are happy using _Some Product XXX_, go ahead.

Otterscan pursues a minimalistic approach and at the same time it is very easy to modify Erigon for your own needs.

Most of the features we implemented are quite basic and it is unfortunate they are not part of the standard API.

> We believe most people end up using _Some Product XXX_ not because of its own unique features, but because the standard JSON-RPC API is quite limited even for basic features.

Implementing everything in-node allows you to plug a dapp directly to your node itself. No need to install any additional indexer middleware or SQL database, each of it own consuming extra disk space and CPU.

> Take Otterscan as an example, **ALL** you need is Otterscan itself (a SPA, can be served by any static provider) and our modified Erigon's rpcdaemon.

## Method summary

All methods are prefixed with the `ots_` namespace in order to make it clear it is vendor-specific and there is no name clash with other same-name implementations.

| Name              | Description      | Reasoning |
|-------------------|------------------|-----------|
| `ots_getApiLevel`           | Totally Otterscan internal API, absolutely no reason for anything outside Otterscan to use it. | Used by Otterscan to check if it's connecting to a compatible patched Erigon node and display a friendly message if it is not. |
| `ots_getInternalOperations` | Return the internal ETH transfers inside a transaction. | For complex contract interactions, there may be internal calls that forward ETH between addresses. A very common example is someone swapping some token for ETH, in this case there is a ETH send to the sender address which is only unveiled by examining the internal calls. |
| `ots_hasCode`               | Check if a certain address contains a deployed code. | A common way to check if an address is a contract or an EOA is calling `eth_getCode` to see if it has some code deployed. However this call is expensive regarding this purpose, as it returns the entire contract code over the network just for the client to check its presence. This call just returns a boolean. |
| `ots_getTransactionError`   | Extract the transaction raw error output. | In order to get the error message or custom error from a failed transaction, you need to get its error output and decoded it. This info is not exposed through standard APIs. |
| `ots_traceTransaction`      | Extract all variations of calls, contract creation and self-destructs and returns a call tree. | This is an optimized version of tracing; regular tracing returns lots of data, and custom tracing using a JS tracer could be slow. |
| `ots_getBlockDetails`       | Tailor-made and expanded version of `eth_getBlock*` for block details page in Otterscan. | The standard `eth_getBlock*` is quite verbose and it doesn't bring all info we need. We explicitly remove the transaction list (unnecessary for that page and also this call doesn't scale well), log blooms and other unnecessary fields. We add issuance and block fees info and return all of this in just one call. |
| `ots_getBlockTransactions`  | Get paginated transactions for a certain block. Also remove some verbose fields like logs. | As block size increases, getting all transactions from a block at once doesn't scale, so the first point here is to add pagination support. The second point is that receipts may have big, unnecessary information, like logs. So we cap all of them to save network bandwidth. |
| `ots_searchTransactionsBefore` and `ots_searchTransactionsAfter` | Gets paginated inbound/outbound transaction calls for a certain address. | There is no native support for any kind of transaction search in the standard JSON-RPC API. We don't want to introduce an additional indexer middleware in Otterscan, so we implemented in-node search. |
| `ots_getTransactionBySenderAndNonce` | Gets the transaction hash for a certain sender address, given its nonce. | There is no native support for this search in the standard JSON-RPC API. Otterscan needs it to allow user navigation between nonces from the same sender address. |

### `ots_getApiLevel`

Very simple API versioning scheme. Every time we add a new capability, the number is incremented. This allows for Otterscan to check if the Erigon node contains all API it needs.

Parameters:

`<none>`

Returns:

`number` containing the API version.

### `ots_getInternalOperations`

Trace internal ETH transfers, contracts creation (CREATE/CREATE2) and self-destructs for a certain transaction.

Parameters:

`txhash` - The transaction hash.

Returns:

`array` of operations, sorted by their occurrence inside the transaction.

The operation is an object with the following fields:

`type` - transfer (`0`), self-destruct (`1`), create (`2`) or create2 (`3`).

`from` - the ETH sender, contract creator or contract address being self-destructed.

`to` - the ETH receiver, newly created contract address or the target ETH receiver resulting of the self-destruction.

`value` - the amount of ETH transferred.

### `ots_hasCode`

Check if an ETH address contains a deployed code.

Parameters:

`address` - The ETH address to be checked.

`block` - The block number or "latest" to check the latest state.

Returns:

`boolean` indicating if the address contains a bytecode or not.

### `ots_getTransactionError`

Given a transaction hash, returns its raw revert reason.

The returned byte blob should be ABI decoded in order to be presented to the user.

For instance, the most common error format is a `string` revert message; in this case, it should be decoded using the `Error(string)` method selector, which will allow you to extract the string message.

If it is not the case, it should probably be a solidity custom error, so you must have the custom error ABI in order to decoded it.

Parameters:

`txhash` - The transaction hash.

Returns:

`string` containing the hexadecimal-formatted error blob or simply a "0x" if the transaction was sucessfully executed.

### `ots_searchTransactionsBefore` and `ots_searchTransactionsAfter`

These are address history navigation methods. They are similar, the difference is `ots_searchTransactionsBefore` searches the history backwards and `ots_searchTransactionsAfter` searches forward a certain point in time.

They are paginated, you **MUST** inform the page size. Some addresses like exchange addresses or very popular DeFi contracts like Uniswap Router will return millions of results.

TODO: finish

### `ots_getTransactionBySenderAndNonce`

Given a sender address and a nonce, returns the tx hash or `null` if not found. It returns only the tx hash on success, you can use the standard `eth_getTransactionByHash` after that to get the full transaction data.

Parameters:

`sender` - The sender ETH address.

`nonce` - The sender nonce.

Returns:

`string` containing the corresponding transaction hash or `null` if it doesn't exist.
