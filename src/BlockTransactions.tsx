import React, { useEffect, useState, useMemo, useContext } from "react";
import { useParams, useLocation } from "react-router";
import { ethers } from "ethers";
import queryString from "query-string";
import StandardFrame from "./StandardFrame";
import BlockTransactionHeader from "./block/BlockTransactionHeader";
import BlockTransactionResults from "./block/BlockTransactionResults";
import {
  InternalOperation,
  OperationType,
  ProcessedTransaction,
} from "./types";
import { PAGE_SIZE } from "./params";
import { RuntimeContext } from "./useRuntime";

type BlockParams = {
  blockNumber: string;
};

type PageParams = {
  p?: number;
};

const BlockTransactions: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams<BlockParams>();
  const location = useLocation<PageParams>();
  const qs = queryString.parse(location.search);
  let pageNumber = 1;
  if (qs.p) {
    try {
      pageNumber = parseInt(qs.p as string);
    } catch (err) {}
  }

  const blockNumber = useMemo(
    () => ethers.BigNumber.from(params.blockNumber),
    [params.blockNumber]
  );

  const [txs, setTxs] = useState<ProcessedTransaction[]>();
  useEffect(() => {
    if (!provider) {
      return;
    }

    const readBlock = async () => {
      const [_block, _receipts] = await Promise.all([
        provider.getBlockWithTransactions(blockNumber.toNumber()),
        provider.send("eth_getBlockReceipts", [blockNumber.toNumber()]),
      ]);
      document.title = `Block #${_block.number} Transactions | Otterscan`;

      const responses = _block.transactions
        .map((t, i): ProcessedTransaction => {
          return {
            blockNumber: blockNumber.toNumber(),
            timestamp: _block.timestamp,
            miner: _block.miner,
            idx: i,
            hash: t.hash,
            from: t.from,
            to: t.to,
            createdContractAddress: _receipts[i].contractAddress,
            value: t.value,
            fee:
              t.type !== 2
                ? provider.formatter
                    .bigNumber(_receipts[i].gasUsed)
                    .mul(t.gasPrice!)
                : provider.formatter
                    .bigNumber(_receipts[i].gasUsed)
                    .mul(t.maxPriorityFeePerGas!.add(_block.baseFeePerGas!)),
            gasPrice:
              t.type !== 2
                ? t.gasPrice!
                : t.maxPriorityFeePerGas!.add(_block.baseFeePerGas!),
            data: t.data,
            status: provider.formatter.number(_receipts[i].status),
          };
        })
        .reverse();
      setTxs(responses);

      const internalChecks = await Promise.all(
        responses.map(async (res) => {
          const r: InternalOperation[] = await provider.send(
            "ots_getInternalOperations",
            [res.hash]
          );
          for (const op of r) {
            if (op.type !== OperationType.TRANSFER) {
              continue;
            }
            if (
              res.miner &&
              (res.miner === ethers.utils.getAddress(op.from) ||
                res.miner === ethers.utils.getAddress(op.to))
            ) {
              return true;
            }
          }
          return false;
        })
      );
      const processedResponses = responses.map((r, i): ProcessedTransaction => {
        return { ...r, internalMinerInteraction: internalChecks[i] };
      });
      setTxs(processedResponses);
    };
    readBlock();
  }, [provider, blockNumber]);

  const page = useMemo(() => {
    if (!txs) {
      return undefined;
    }
    const pageStart = (pageNumber - 1) * PAGE_SIZE;
    return txs.slice(pageStart, pageStart + PAGE_SIZE);
  }, [txs, pageNumber]);
  const total = useMemo(() => txs?.length ?? 0, [txs]);

  document.title = `Block #${blockNumber} Txns | Otterscan`;

  return (
    <StandardFrame>
      <BlockTransactionHeader blockTag={blockNumber.toNumber()} />
      <BlockTransactionResults
        page={page}
        total={total}
        pageNumber={pageNumber}
      />
    </StandardFrame>
  );
};

export default React.memo(BlockTransactions);
