# Optimism

There are optimism specific tweaks to satisfy [op-stack specifications](https://github.com/ethereum-optimism/optimism/tree/develop/specs).

## [L1-Cost Fees](https://github.com/ethereum-optimism/optimism/blob/develop/specs/exec-engine.md#l1-cost-fees-l1-fee-vault)

Transaction page now shows l1 cost fee related fields:
- `L1 Gas Price`
- `L1 Fee Scalar`
- `L1 Gas Used by Txn`

## [Deposit Transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md)

When [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718) compatible transaction type has prefix `0x7E`, label as `depositTx` type in transaction page.

For `depositTx`, transaction fee is zero because gas price is zero. Therefore it is nonsense to display ratio between burnt fees and others. Therefore removed reward split for deposit transactions.

## Misc

- Disabled EIP-1559 page
- Handle error when RPC response does not include `tx.GasPrice`
