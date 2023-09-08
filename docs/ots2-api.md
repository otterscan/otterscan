# Experimental Otterscan v2 API

> These are the docs for the experimental Otterscan v2 APIs. For Otterscan 1 APIs docs, click [here](./custom-jsonrpc.md).

All those methods are subjected to be changed during Otterscan 2 alpha period.

There may be more methods added, removed, merged, etc.

## Method summary

All methods are prefixed with the `ots2_` namespace in order to make it clear it is vendor-specific and there is no name clash with other same-name implementations.

| Name              | Description      |
|-------------------|------------------|
| `ots2_getAllContractsList` | Gets a paginated list of deployed contracts. |
| `ots2_getAllContractsCount` | Gets the total count of deployed contracts.
| `ots2_getERC20List` | Gets a paginated list of ERC20 contracts. |
| `ots2_getERC20Count` | Gets the total count of ERC20 contracts. |
| `ots2_getERC721List` | Gets a paginated list of ERC721 contracts. |
| `ots2_getERC721Count` | Gets the total count of ERC721 contracts. |
| `ots2_getERC1155List` | Gets a paginated list of ERC1155 contracts. |
| `ots2_getERC1155Count` | Gets the total count of ERC1155 contracts. |
| `ots2_getERC1167List` | Gets a paginated list of ERC1167 minimal proxy contracts. |
| `ots2_getERC1167Count` | Gets the total count of ERC721 minimal proxy contracts. |
| `ots2_getERC4626List` | Gets a paginated list of ERC4626 vault contracts. |
| `ots2_getERC4626Count` | Gets the total count of ERC4626 vault contracts. |
| `ots2_getERC1167Impl` | Gets the logical contract associated to an ERC1167 minimal proxy. |
| `ots2_getAddressAttributes` | Given an address, returns a summarize list of attributes associated to that address, e.g., is it an ERC20? a minimal proxy? |
| `ots2_getERC20TransferList` | Gets a paginated list of transactions that contain ERC20 transfers from/to a certain address. |
| `ots2_getERC20TransferCount` | Gets the total count of transactions that contain ERC20 transfers from/to a certain address. |
| `ots2_getERC721TransferList` | Gets a paginated list of transactions that contain ERC721 transfers from/to a certain address. |
| `ots2_getERC721TransferCount` | Gets the total count of transactions that contain ERC721 transfers from/to a certain address. |
| `ots2_getERC20Holdings` | Given a certain address, returns all ERC20 that have interacted with it. |
