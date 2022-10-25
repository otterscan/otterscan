package commands

import (
	"bytes"
	"context"
	"math/big"
	"sync"
	"time"

	lru "github.com/hashicorp/golang-lru"
	"github.com/holiman/uint256"
	"github.com/ledgerwatch/erigon-lib/kv"
	libstate "github.com/ledgerwatch/erigon-lib/state"
	"github.com/ledgerwatch/log/v3"

	"github.com/ledgerwatch/erigon-lib/kv/kvcache"
	"github.com/ledgerwatch/erigon/cmd/rpcdaemon/commands"
	"github.com/ledgerwatch/erigon/common"
	"github.com/ledgerwatch/erigon/common/hexutil"
	"github.com/ledgerwatch/erigon/common/math"
	"github.com/ledgerwatch/erigon/consensus/misc"
	"github.com/ledgerwatch/erigon/core/rawdb"
	"github.com/ledgerwatch/erigon/core/types"
	"github.com/ledgerwatch/erigon/params"
	"github.com/ledgerwatch/erigon/rpc"
	"github.com/ledgerwatch/erigon/turbo/rpchelper"
	"github.com/ledgerwatch/erigon/turbo/services"
)

type BaseAPIUtils struct {
	*commands.BaseAPI

	stateCache   kvcache.Cache // thread-safe
	blocksLRU    *lru.Cache    // thread-safe
	filters      *rpchelper.Filters
	_chainConfig *params.ChainConfig
	_genesis     *types.Block
	_genesisLock sync.RWMutex

	_historyV3     *bool
	_historyV3Lock sync.RWMutex

	_blockReader services.FullBlockReader
	_txnReader   services.TxnReader
	_agg         *libstate.Aggregator22

	evmCallTimeout time.Duration
}

func NewBaseUtilsApi(f *rpchelper.Filters, stateCache kvcache.Cache, blockReader services.FullBlockReader, agg *libstate.Aggregator22, singleNodeMode bool, evmCallTimeout time.Duration) *BaseAPIUtils {
	blocksLRUSize := 128 // ~32Mb
	if !singleNodeMode {
		blocksLRUSize = 512
	}
	blocksLRU, err := lru.New(blocksLRUSize)
	if err != nil {
		panic(err)
	}

	return &BaseAPIUtils{filters: f, stateCache: stateCache, blocksLRU: blocksLRU, _blockReader: blockReader, _txnReader: blockReader, _agg: agg, evmCallTimeout: evmCallTimeout}
}

func (api *BaseAPIUtils) chainConfig(tx kv.Tx) (*params.ChainConfig, error) {
	cfg, _, err := api.chainConfigWithGenesis(tx)
	return cfg, err
}

// nolint:unused
func (api *BaseAPIUtils) genesis(tx kv.Tx) (*types.Block, error) {
	_, genesis, err := api.chainConfigWithGenesis(tx)
	return genesis, err
}

func (api *BaseAPIUtils) txnLookup(ctx context.Context, tx kv.Tx, txnHash common.Hash) (uint64, bool, error) {
	return api._txnReader.TxnLookup(ctx, tx, txnHash)
}

func (api *BaseAPIUtils) blockByNumberWithSenders(tx kv.Tx, number uint64) (*types.Block, error) {
	hash, hashErr := rawdb.ReadCanonicalHash(tx, number)
	if hashErr != nil {
		return nil, hashErr
	}
	return api.blockWithSenders(tx, hash, number)
}
func (api *BaseAPIUtils) blockByHashWithSenders(tx kv.Tx, hash common.Hash) (*types.Block, error) {
	if api.blocksLRU != nil {
		if it, ok := api.blocksLRU.Get(hash); ok && it != nil {
			return it.(*types.Block), nil
		}
	}
	number := rawdb.ReadHeaderNumber(tx, hash)
	if number == nil {
		return nil, nil
	}

	return api.blockWithSenders(tx, hash, *number)
}
func (api *BaseAPIUtils) blockWithSenders(tx kv.Tx, hash common.Hash, number uint64) (*types.Block, error) {
	if api.blocksLRU != nil {
		if it, ok := api.blocksLRU.Get(hash); ok && it != nil {
			return it.(*types.Block), nil
		}
	}
	block, _, err := api._blockReader.BlockWithSenders(context.Background(), tx, hash, number)
	if err != nil {
		return nil, err
	}
	if block == nil { // don't save nil's to cache
		return nil, nil
	}
	// don't save empty blocks to cache, because in Erigon
	// if block become non-canonical - we remove it's transactions, but block can become canonical in future
	if block.Transactions().Len() == 0 {
		return block, nil
	}
	if api.blocksLRU != nil {
		// calc fields before put to cache
		for _, txn := range block.Transactions() {
			txn.Hash()
		}
		block.Hash()
		api.blocksLRU.Add(hash, block)
	}
	return block, nil
}

func (api *BaseAPIUtils) historyV3(tx kv.Tx) bool {
	api._historyV3Lock.RLock()
	historyV3 := api._historyV3
	api._historyV3Lock.RUnlock()

	if historyV3 != nil {
		return *historyV3
	}
	enabled, err := rawdb.HistoryV3.Enabled(tx)
	if err != nil {
		log.Warn("HisoryV2Enabled: read", "err", err)
		return false
	}
	api._historyV3Lock.Lock()
	api._historyV3 = &enabled
	api._historyV3Lock.Unlock()
	return enabled
}

func (api *BaseAPIUtils) chainConfigWithGenesis(tx kv.Tx) (*params.ChainConfig, *types.Block, error) {
	api._genesisLock.RLock()
	cc, genesisBlock := api._chainConfig, api._genesis
	api._genesisLock.RUnlock()

	if cc != nil {
		return cc, genesisBlock, nil
	}
	genesisBlock, err := rawdb.ReadBlockByNumber(tx, 0)
	if err != nil {
		return nil, nil, err
	}
	cc, err = rawdb.ReadChainConfig(tx, genesisBlock.Hash())
	if err != nil {
		return nil, nil, err
	}
	if cc != nil && genesisBlock != nil {
		api._genesisLock.Lock()
		api._genesis = genesisBlock
		api._chainConfig = cc
		api._genesisLock.Unlock()
	}
	return cc, genesisBlock, nil
}

func (api *BaseAPIUtils) pendingBlock() *types.Block {
	return api.filters.LastPendingBlock()
}

func (api *BaseAPIUtils) blockByRPCNumber(number rpc.BlockNumber, tx kv.Tx) (*types.Block, error) {
	n, _, _, err := rpchelper.GetBlockNumber(rpc.BlockNumberOrHashWithNumber(number), tx, api.filters)
	if err != nil {
		return nil, err
	}

	block, err := api.blockByNumberWithSenders(tx, n)
	return block, err
}

func (api *BaseAPIUtils) headerByRPCNumber(number rpc.BlockNumber, tx kv.Tx) (*types.Header, error) {
	n, h, _, err := rpchelper.GetBlockNumber(rpc.BlockNumberOrHashWithNumber(number), tx, api.filters)
	if err != nil {
		return nil, err
	}
	return api._blockReader.Header(context.Background(), tx, h, n)
}

// newRPCTransaction returns a transaction that will serialize to the RPC
// representation, with the given location metadata set (if available).
func newRPCTransaction(tx types.Transaction, blockHash common.Hash, blockNumber uint64, index uint64, baseFee *big.Int) *commands.RPCTransaction {
	// Determine the signer. For replay-protected transactions, use the most permissive
	// signer, because we assume that signers are backwards-compatible with old
	// transactions. For non-protected transactions, the homestead signer signer is used
	// because the return value of ChainId is zero for those transactions.
	var chainId *big.Int
	result := &commands.RPCTransaction{
		Type:  hexutil.Uint64(tx.Type()),
		Gas:   hexutil.Uint64(tx.GetGas()),
		Hash:  tx.Hash(),
		Input: hexutil.Bytes(tx.GetData()),
		Nonce: hexutil.Uint64(tx.GetNonce()),
		To:    tx.GetTo(),
		Value: (*hexutil.Big)(tx.GetValue().ToBig()),
	}
	switch t := tx.(type) {
	case *types.LegacyTx:
		chainId = types.DeriveChainId(&t.V).ToBig()
		result.GasPrice = (*hexutil.Big)(t.GasPrice.ToBig())
		result.V = (*hexutil.Big)(t.V.ToBig())
		result.R = (*hexutil.Big)(t.R.ToBig())
		result.S = (*hexutil.Big)(t.S.ToBig())
	case *types.AccessListTx:
		chainId = t.ChainID.ToBig()
		result.ChainID = (*hexutil.Big)(chainId)
		result.GasPrice = (*hexutil.Big)(t.GasPrice.ToBig())
		result.V = (*hexutil.Big)(t.V.ToBig())
		result.R = (*hexutil.Big)(t.R.ToBig())
		result.S = (*hexutil.Big)(t.S.ToBig())
		result.Accesses = &t.AccessList
	case *types.DynamicFeeTransaction:
		chainId = t.ChainID.ToBig()
		result.ChainID = (*hexutil.Big)(chainId)
		result.Tip = (*hexutil.Big)(t.Tip.ToBig())
		result.FeeCap = (*hexutil.Big)(t.FeeCap.ToBig())
		result.V = (*hexutil.Big)(t.V.ToBig())
		result.R = (*hexutil.Big)(t.R.ToBig())
		result.S = (*hexutil.Big)(t.S.ToBig())
		result.Accesses = &t.AccessList
		baseFee, overflow := uint256.FromBig(baseFee)
		if baseFee != nil && !overflow && blockHash != (common.Hash{}) {
			// price = min(tip + baseFee, gasFeeCap)
			price := math.Min256(new(uint256.Int).Add(tx.GetTip(), baseFee), tx.GetFeeCap())
			result.GasPrice = (*hexutil.Big)(price.ToBig())
		} else {
			result.GasPrice = nil
		}
	}
	signer := types.LatestSignerForChainID(chainId)
	result.From, _ = tx.Sender(*signer)
	if blockHash != (common.Hash{}) {
		result.BlockHash = &blockHash
		result.BlockNumber = (*hexutil.Big)(new(big.Int).SetUint64(blockNumber))
		result.TransactionIndex = (*hexutil.Uint64)(&index)
	}
	return result
}

// newRPCBorTransaction returns a Bor transaction that will serialize to the RPC
// representation, with the given location metadata set (if available).
func newRPCBorTransaction(opaqueTx types.Transaction, txHash common.Hash, blockHash common.Hash, blockNumber uint64, index uint64, baseFee *big.Int) *commands.RPCTransaction {
	tx := opaqueTx.(*types.LegacyTx)
	result := &commands.RPCTransaction{
		Type:     hexutil.Uint64(tx.Type()),
		ChainID:  (*hexutil.Big)(new(big.Int)),
		GasPrice: (*hexutil.Big)(tx.GasPrice.ToBig()),
		Gas:      hexutil.Uint64(tx.GetGas()),
		Hash:     txHash,
		Input:    hexutil.Bytes(tx.GetData()),
		Nonce:    hexutil.Uint64(tx.GetNonce()),
		From:     common.Address{},
		To:       tx.GetTo(),
		Value:    (*hexutil.Big)(tx.GetValue().ToBig()),
	}
	if blockHash != (common.Hash{}) {
		result.BlockHash = &blockHash
		result.BlockNumber = (*hexutil.Big)(new(big.Int).SetUint64(blockNumber))
		result.TransactionIndex = (*hexutil.Uint64)(&index)
	}
	return result
}

// newRPCPendingTransaction returns a pending transaction that will serialize to the RPC representation
func newRPCPendingTransaction(tx types.Transaction, current *types.Header, config *params.ChainConfig) *commands.RPCTransaction {
	var baseFee *big.Int
	if current != nil {
		baseFee = misc.CalcBaseFee(config, current)
	}
	return newRPCTransaction(tx, common.Hash{}, 0, 0, baseFee)
}

// newRPCRawTransactionFromBlockIndex returns the bytes of a transaction given a block and a transaction index.
func newRPCRawTransactionFromBlockIndex(b *types.Block, index uint64) (hexutil.Bytes, error) {
	txs := b.Transactions()
	if index >= uint64(len(txs)) {
		return nil, nil
	}
	var buf bytes.Buffer
	err := txs[index].MarshalBinary(&buf)
	return buf.Bytes(), err
}
