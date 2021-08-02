import React, { useEffect, useState, useMemo, useContext } from "react";
import { useParams, useLocation } from "react-router";
import { ethers } from "ethers";
import queryString from "query-string";
import StandardFrame from "./StandardFrame";
import BlockTransactionHeader from "./block/BlockTransactionHeader";
import BlockTransactionResults from "./block/BlockTransactionResults";
import { OperationType, ProcessedTransaction } from "./types";
import { PAGE_SIZE } from "./params";
import { RuntimeContext } from "./useRuntime";
import { getInternalOperations } from "./nodeFunctions";

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

      const responses = _block.transactions
        .map(
          (t, i): ProcessedTransaction => ({
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
          })
        )
        .reverse();
      setTxs(responses);

      const checkTouchMinerAddr = await Promise.all(
        responses.map(async (res) => {
          const ops = await getInternalOperations(provider, res.hash);
          return (
            ops.findIndex(
              (op) =>
                op.type === OperationType.TRANSFER &&
                res.miner !== undefined &&
                res.miner === ethers.utils.getAddress(op.to)
            ) !== -1
          );
        })
      );
      const processedResponses = responses.map(
        (r, i): ProcessedTransaction => ({
          ...r,
          internalMinerInteraction: checkTouchMinerAddr[i],
        })
      );
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
