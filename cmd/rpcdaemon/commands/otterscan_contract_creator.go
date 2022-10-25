package commands

import (
	"bytes"
	"context"
	"fmt"
	"sort"

	"github.com/RoaringBitmap/roaring/roaring64"
	"github.com/ledgerwatch/erigon-lib/kv"
	"github.com/ledgerwatch/erigon/common"
	"github.com/ledgerwatch/erigon/common/changeset"
	"github.com/ledgerwatch/erigon/consensus/ethash"
	"github.com/ledgerwatch/erigon/core"
	"github.com/ledgerwatch/erigon/core/state"
	"github.com/ledgerwatch/erigon/core/types"
	"github.com/ledgerwatch/erigon/core/types/accounts"
	"github.com/ledgerwatch/erigon/core/vm"
	"github.com/ledgerwatch/erigon/params"
	"github.com/ledgerwatch/erigon/turbo/shards"
	"github.com/ledgerwatch/log/v3"
)

type ContractCreatorData struct {
	Tx      common.Hash    `json:"hash"`
	Creator common.Address `json:"creator"`
}

func (api *OtterscanAPIImpl) GetContractCreator(ctx context.Context, addr common.Address) (*ContractCreatorData, error) {
	tx, err := api.db.BeginRo(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	reader := state.NewPlainStateReader(tx)
	plainStateAcc, err := reader.ReadAccountData(addr)
	if err != nil {
		return nil, err
	}

	// No state == non existent
	if plainStateAcc == nil {
		return nil, nil
	}

	// EOA?
	if plainStateAcc.IsEmptyCodeHash() {
		return nil, nil
	}

	// Contract; search for creation tx; navigate forward on AccountsHistory/ChangeSets
	//
	// We search shards in forward order on purpose because popular contracts may have
	// dozens of states changes due to ETH deposits/withdraw after contract creation,
	// so it is optimal to search from the beginning even if the contract has multiple
	// incarnations.
	accHistory, err := tx.Cursor(kv.AccountsHistory)
	if err != nil {
		return nil, err
	}
	defer accHistory.Close()

	accCS, err := tx.CursorDupSort(kv.AccountChangeSet)
	if err != nil {
		return nil, err
	}
	defer accCS.Close()

	// Locate shard that contains the block where incarnation changed
	acs := changeset.Mapper[kv.AccountChangeSet]
	k, v, err := accHistory.Seek(acs.IndexChunkKey(addr.Bytes(), 0))
	if err != nil {
		return nil, err
	}
	if !bytes.HasPrefix(k, addr.Bytes()) {
		log.Error("Couldn't find any shard for account history", "addr", addr)
		return nil, fmt.Errorf("could't find any shard for account history addr=%v", addr)
	}

	var acc accounts.Account
	bm := roaring64.NewBitmap()
	prevShardMaxBl := uint64(0)
	for {
		_, err := bm.ReadFrom(bytes.NewReader(v))
		if err != nil {
			return nil, err
		}

		// Shortcut precheck
		st, err := acs.Find(accCS, bm.Maximum(), addr.Bytes())
		if err != nil {
			return nil, err
		}
		if st == nil {
			log.Error("Unexpected error, couldn't find changeset", "block", bm.Maximum(), "addr", addr)
			return nil, fmt.Errorf("unexpected error, couldn't find changeset block=%v addr=%v", bm.Maximum(), addr)
		}

		// Found the shard where the incarnation change happens; ignore all
		// next shards
		if err := acc.DecodeForStorage(st); err != nil {
			return nil, err
		}
		if acc.Incarnation >= plainStateAcc.Incarnation {
			break
		}
		prevShardMaxBl = bm.Maximum()

		k, v, err = accHistory.Next()
		if err != nil {
			return nil, err
		}

		// No more shards; it means the max bl from previous shard
		// contains the incarnation change
		if !bytes.HasPrefix(k, addr.Bytes()) {
			break
		}
	}

	// Binary search block number inside shard; get first block where desired
	// incarnation appears
	blocks := bm.ToArray()
	var searchErr error
	r := sort.Search(len(blocks), func(i int) bool {
		bl := blocks[i]
		st, err := acs.Find(accCS, bl, addr.Bytes())
		if err != nil {
			searchErr = err
			return false
		}
		if st == nil {
			log.Error("Unexpected error, couldn't find changeset", "block", bl, "addr", addr)
			return false
		}

		if err := acc.DecodeForStorage(st); err != nil {
			searchErr = err
			return false
		}
		if acc.Incarnation < plainStateAcc.Incarnation {
			return false
		}
		return true
	})

	if searchErr != nil {
		return nil, searchErr
	}

	// The sort.Search function finds the first block where the incarnation has
	// changed to the desired one, so we get the previous block from the bitmap;
	// however if the found block is already the first one from the bitmap, it means
	// the block we want is the max block from the previous shard.
	blockFound := prevShardMaxBl
	if r > 0 {
		blockFound = blocks[r-1]
	}

	// Trace block, find tx and contract creator
	chainConfig, err := api.chainConfig(tx)
	if err != nil {
		return nil, err
	}
	tracer := NewCreateTracer(ctx, addr)
	if err := api.deployerFinder(tx, ctx, blockFound, chainConfig, tracer); err != nil {
		return nil, err
	}

	return &ContractCreatorData{
		Tx:      tracer.Tx.Hash(),
		Creator: tracer.Creator,
	}, nil
}

func (api *OtterscanAPIImpl) deployerFinder(dbtx kv.Tx, ctx context.Context, blockNum uint64, chainConfig *params.ChainConfig, tracer GenericTracer) error {
	block, err := api.blockByNumberWithSenders(dbtx, blockNum)
	if err != nil {
		return err
	}
	if block == nil {
		return nil
	}

	reader := state.NewPlainState(dbtx, blockNum)
	stateCache := shards.NewStateCache(32, 0 /* no limit */)
	cachedReader := state.NewCachedReader(reader, stateCache)
	noop := state.NewNoopWriter()
	cachedWriter := state.NewCachedWriter(noop, stateCache)

	ibs := state.New(cachedReader)
	signer := types.MakeSigner(chainConfig, blockNum)

	getHeader := func(hash common.Hash, number uint64) *types.Header {
		h, e := api._blockReader.Header(ctx, dbtx, hash, number)
		if e != nil {
			log.Error("getHeader error", "number", number, "hash", hash, "err", e)
		}
		return h
	}
	engine := ethash.NewFaker()

	header := block.Header()
	rules := chainConfig.Rules(block.NumberU64())
	// we can filter away anything that does not include 0xf0, 0xf5, or 0x38, aka create, create2 or codesize opcodes
	// while this will result in false positives, it should reduce the time a lot.
	// it can be improved in the future with smarter algorithms (ala, looking for
	deployers := map[common.Address]struct{}{}
	for _, tx := range block.Transactions() {
		dat := tx.GetData()
		for _, v := range dat {
			if sender, ok := tx.GetSender(); ok {
				if v == 0xf0 || v == 0xf5 {
					deployers[sender] = struct{}{}
				}
			}
		}
	}
	for idx, tx := range block.Transactions() {
		if sender, ok := tx.GetSender(); ok {
			if _, ok := deployers[sender]; !ok {
				continue
			}
		}
		ibs.Prepare(tx.Hash(), block.Hash(), idx)

		msg, _ := tx.AsMessage(*signer, header.BaseFee, rules)

		BlockContext := core.NewEVMBlockContext(header, core.GetHashFn(header, getHeader), engine, nil)
		TxContext := core.NewEVMTxContext(msg)

		vmenv := vm.NewEVM(BlockContext, TxContext, ibs, chainConfig, vm.Config{Debug: true, Tracer: tracer})
		if _, err := core.ApplyMessage(vmenv, msg, new(core.GasPool).AddGas(tx.GetGas()), true /* refunds */, false /* gasBailout */); err != nil {
			return err
		}
		_ = ibs.FinalizeTx(vmenv.ChainConfig().Rules(block.NumberU64()), cachedWriter)

		if tracer.Found() {
			tracer.SetTransaction(tx)
			return nil
		}
	}
	return nil
}
