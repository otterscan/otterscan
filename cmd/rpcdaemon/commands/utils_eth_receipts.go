package commands

import (
	"context"
	"math/big"

	"github.com/holiman/uint256"
	"github.com/ledgerwatch/erigon-lib/kv"
	"github.com/ledgerwatch/erigon/common"
	"github.com/ledgerwatch/erigon/common/hexutil"
	"github.com/ledgerwatch/erigon/consensus/ethash"
	"github.com/ledgerwatch/erigon/core"
	"github.com/ledgerwatch/erigon/core/rawdb"
	"github.com/ledgerwatch/erigon/core/state"
	"github.com/ledgerwatch/erigon/core/types"
	"github.com/ledgerwatch/erigon/core/vm"
	"github.com/ledgerwatch/erigon/params"
	"github.com/ledgerwatch/erigon/turbo/transactions"
	"github.com/ledgerwatch/log/v3"
)

func (api *BaseAPIUtils) getReceipts(ctx context.Context, tx kv.Tx, chainConfig *params.ChainConfig, block *types.Block, senders []common.Address) (types.Receipts, error) {
	if cached := rawdb.ReadReceipts(tx, block, senders); cached != nil {
		return cached, nil
	}

	getHeader := func(hash common.Hash, number uint64) *types.Header {
		h, e := api._blockReader.Header(ctx, tx, hash, number)
		if e != nil {
			log.Error("getHeader error", "number", number, "hash", hash, "err", e)
		}
		return h
	}
	_, _, _, ibs, _, err := transactions.ComputeTxEnv(ctx, block, chainConfig, getHeader, ethash.NewFaker(), tx, block.Hash(), 0)
	if err != nil {
		return nil, err
	}

	usedGas := new(uint64)
	gp := new(core.GasPool).AddGas(block.GasLimit())

	ethashFaker := ethash.NewFaker()
	noopWriter := state.NewNoopWriter()

	receipts := make(types.Receipts, len(block.Transactions()))

	for i, txn := range block.Transactions() {
		ibs.Prepare(txn.Hash(), block.Hash(), i)
		header := block.Header()
		receipt, _, err := core.ApplyTransaction(chainConfig, core.GetHashFn(header, getHeader), ethashFaker, nil, gp, ibs, noopWriter, header, txn, usedGas, vm.Config{})
		if err != nil {
			return nil, err
		}
		receipt.BlockHash = block.Hash()
		receipts[i] = receipt
	}

	return receipts, nil
}

func marshalReceipt(receipt *types.Receipt, txn types.Transaction, chainConfig *params.ChainConfig, block *types.Block, txnHash common.Hash, signed bool) map[string]interface{} {
	var chainId *big.Int
	switch t := txn.(type) {
	case *types.LegacyTx:
		if t.Protected() {
			chainId = types.DeriveChainId(&t.V).ToBig()
		}
	case *types.AccessListTx:
		chainId = t.ChainID.ToBig()
	case *types.DynamicFeeTransaction:
		chainId = t.ChainID.ToBig()
	}

	var from common.Address
	if signed {
		signer := types.LatestSignerForChainID(chainId)
		from, _ = txn.Sender(*signer)
	}

	fields := map[string]interface{}{
		"blockHash":         receipt.BlockHash,
		"blockNumber":       hexutil.Uint64(receipt.BlockNumber.Uint64()),
		"transactionHash":   txnHash,
		"transactionIndex":  hexutil.Uint64(receipt.TransactionIndex),
		"from":              from,
		"to":                txn.GetTo(),
		"type":              hexutil.Uint(txn.Type()),
		"gasUsed":           hexutil.Uint64(receipt.GasUsed),
		"cumulativeGasUsed": hexutil.Uint64(receipt.CumulativeGasUsed),
		"contractAddress":   nil,
		"logs":              receipt.Logs,
		"logsBloom":         types.CreateBloom(types.Receipts{receipt}),
	}

	if !chainConfig.IsLondon(block.NumberU64()) {
		fields["effectiveGasPrice"] = hexutil.Uint64(txn.GetPrice().Uint64())
	} else {
		baseFee, _ := uint256.FromBig(block.BaseFee())
		gasPrice := new(big.Int).Add(block.BaseFee(), txn.GetEffectiveGasTip(baseFee).ToBig())
		fields["effectiveGasPrice"] = hexutil.Uint64(gasPrice.Uint64())
	}
	// Assign receipt status.
	fields["status"] = hexutil.Uint64(receipt.Status)
	if receipt.Logs == nil {
		fields["logs"] = [][]*types.Log{}
	}
	// If the ContractAddress is 20 0x0 bytes, assume it is not a contract creation
	if receipt.ContractAddress != (common.Address{}) {
		fields["contractAddress"] = receipt.ContractAddress
	}
	return fields
}
