# Otterscan JSON-RPC API extensions

The [standard Ethereum JSON-RPC APIs](https://ethereum.org/en/developers/docs/apis/json-rpc/) are very limitting and in some cases non-performant for what you can do with an archive node.

There is plenty of useful data that can be extracted and we implemented some extra RPC methods for them.

They are all used by Otterscan, but we are documenting them here so others can try it, give feedback and eventually get it merged upstream if they are generalized enough.

We take an incremental approach when design the APIs, so there may be some methods very specific to Otterscan use cases, others that look more generic.

## Method summary

All methods are prefixed with the `ots_` namespace in order to make it clear it is vendor-specific and there is no name clash with other same-name implementations.

| Name              | Description      | Reasoning |
|-------------------|------------------|-----------|
| `ots_getApiLevel`           | Totally Otterscan internal API, absolutely no reason for anything outside Otterscan to use it. | Used by Otterscan to check if it's connecting to a compatible patched Erigon node. |
| `ots_getInternalOperations` | Return the internal ETH transfers inside a transaction. | For complex contract interactions, there may be internal calls that forward ETH between addresses. A very common example is someone swapping some token for ETH, in this case there is a ETH send to the sender address which is only unveiled by examining the internal calls. |
| `ots_hasCode`               | Check if a certain address contains a deployed code. | A common way to check if an address is aa contract or EOA is calling `eth_getCode` to see if it has some code deployed. However this call is expensive regarding this purpose, as it returns the entire contract code over the network just for the client to check its presence. This call just returns a boolean. |
| `ots_getTransactionError`   | Extract the transaction raw error output. | In order to get the error message or custom error from a failed transaction, you need to get its error output and decoded it. This info is not exposed through standard APIs. |
| `ots_traceTransaction`      | Extract all variations of calls, contract creation and self-destructs and returns a call tree. | This is an optimized version of tracing; regular tracing returns lots of data, and custom tracing using a JS tracer could be slow. |
| `ots_getBlockDetails`       | Tailor-made and expanded version of `eth_getBlock*` for block details page in Otterscan. | The standard `eth_getBlock*` is quite verbose and it doesn't bring all info we need. We explicitly remove the transaction list (unnecessary for that page and also this call doesn't scale well), log blooms and other unnecessary fields. We add issuance and block fees info and return all of this in just one call. |
| `ots_getBlockTransactions`  | Get paginated transactions for a certain block. Also remove some verbose fields like logs. | As block size increases, getting all transactions from a block aat once doesn't scale, so the first point here is to add pagination support. The second point is that receipts may have big, unnec essary information, like logs. So we cap all of them of save network bandwidth. |
| `ots_searchTransactionsBefore` and `ots_searchTransactionsAfter` | Gets paginated inbound/outbound transaction calls for a certain address. | There is no native support for any kind of transaction search in the standard jsonrpc API. We don't want to introduce an additional indexer middleware in Otterscan, so we implemented in-node search. |
| `ots_getTransactionBySenderAndNonce` | Gets the transaction hash for a certain sender address, given its nonce. |

### `ots_getTransactionBySenderAndNonce`

Given a sender address and a nonce, returns the tx hash or `null` if not found. It returns only the tx hash on success, you can use the standard `eth_getTransactionByHash` after that to get the full transaction data.

Parameters:

`sender` - The sender ETH address.

`nonce` - The sender nonce.

Returns:

`string` containing the corresponding transaction hash or `null` if it doesn't exist.
