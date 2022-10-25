package commands

import (
	"context"

	"github.com/ledgerwatch/erigon-lib/kv"

	"github.com/ledgerwatch/erigon/common"
	"github.com/ledgerwatch/erigon/common/hexutil"
	"github.com/ledgerwatch/erigon/core/types"
	"github.com/ledgerwatch/erigon/params"
	"github.com/ledgerwatch/erigon/rpc"
	"github.com/ledgerwatch/erigon/turbo/rpchelper"
)

// headerByNumberOrHash - intent to read recent headers only
func headerByNumberOrHash(ctx context.Context, tx kv.Tx, blockNrOrHash rpc.BlockNumberOrHash, api *BaseAPIUtils) (*types.Header, error) {
	blockNum, _, _, err := rpchelper.GetBlockNumber(blockNrOrHash, tx, api.filters)
	if err != nil {
		return nil, err
	}
	header, err := api._blockReader.HeaderByNumber(ctx, tx, blockNum)
	if err != nil {
		return nil, err
	}
	// header can be nil
	return header, nil
}

// accessListResult returns an optional accesslist
// Its the result of the `eth_createAccessList` RPC call.
// It contains an error if the transaction itself failed.
type accessListResult struct {
	Accesslist *types.AccessList `json:"accessList"`
	Error      string            `json:"error,omitempty"`
	GasUsed    hexutil.Uint64    `json:"gasUsed"`
}

// to address is warm already, so we can save by adding it to the access list
// only if we are adding a lot of its storage slots as well
func optimizeToInAccessList(accessList *accessListResult, to common.Address) {
	indexToRemove := -1

	for i := 0; i < len(*accessList.Accesslist); i++ {
		entry := (*accessList.Accesslist)[i]
		if entry.Address != to {
			continue
		}

		// https://eips.ethereum.org/EIPS/eip-2930#charging-less-for-accesses-in-the-access-list
		accessListSavingPerSlot := params.ColdSloadCostEIP2929 - params.WarmStorageReadCostEIP2929 - params.TxAccessListStorageKeyGas

		numSlots := uint64(len(entry.StorageKeys))
		if numSlots*accessListSavingPerSlot <= params.TxAccessListAddressGas {
			indexToRemove = i
		}
	}

	if indexToRemove >= 0 {
		*accessList.Accesslist = removeIndex(*accessList.Accesslist, indexToRemove)
	}
}

func removeIndex(s types.AccessList, index int) types.AccessList {
	return append(s[:index], s[index+1:]...)
}
