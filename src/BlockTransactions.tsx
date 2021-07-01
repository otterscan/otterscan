import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router";
import { ethers } from "ethers";
import queryString from "query-string";
import { provider } from "./ethersconfig";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import PageControl from "./search/PageControl";
import ResultHeader from "./search/ResultHeader";
import PendingResults from "./search/PendingResults";
import TransactionItem from "./search/TransactionItem";
import BlockLink from "./components/BlockLink";
import { ProcessedTransaction } from "./types";
import { PAGE_SIZE } from "./params";
import { useFeeToggler } from "./search/useFeeToggler";

type BlockParams = {
  blockNumber: string;
};

type PageParams = {
  p?: number;
};

const BlockTransactions: React.FC = () => {
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
    const readBlock = async () => {
      const [_block, _receipts] = await Promise.all([
        provider.getBlockWithTransactions(blockNumber.toNumber()),
        provider.send("eth_getBlockReceipts", [blockNumber.toNumber()]),
      ]);
      document.title = `Block #${_block.number} Transactions | Otterscan`;

      setTxs(
        _block.transactions
          .map((t, i) => {
            return {
              blockNumber: blockNumber.toNumber(),
              timestamp: _block.timestamp,
              idx: i,
              hash: t.hash,
              from: t.from,
              to: t.to,
              value: t.value,
              fee: t.gasLimit.mul(t.gasPrice!),
              gasPrice: t.gasPrice!,
              data: t.data,
              status: _receipts[i].status,
            };
          })
          .reverse()
      );
    };
    readBlock();
  }, [blockNumber]);

  const page = useMemo(() => {
    if (!txs) {
      return undefined;
    }
    const pageStart = (pageNumber - 1) * PAGE_SIZE;
    return txs.slice(pageStart, pageStart + PAGE_SIZE);
  }, [txs, pageNumber]);
  const total = useMemo(() => txs?.length ?? 0, [txs]);

  document.title = `Block #${blockNumber} Txns | Otterscan`;

  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  return (
    <StandardFrame>
      <StandardSubtitle>Transactions</StandardSubtitle>
      <div className="pb-2 text-sm text-gray-500">
        For Block <BlockLink blockTag={blockNumber.toNumber()} />
      </div>
      <ContentFrame>
        <div className="flex justify-between items-baseline py-3">
          <div className="text-sm text-gray-500">
            {page === undefined ? (
              <>Waiting for search results...</>
            ) : (
              <>A total of {total} transactions found</>
            )}
          </div>
          <PageControl
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
          />
        </div>
        <ResultHeader
          feeDisplay={feeDisplay}
          feeDisplayToggler={feeDisplayToggler}
        />
        {page ? (
          <>
            {page.map((tx) => (
              <TransactionItem key={tx.hash} tx={tx} feeDisplay={feeDisplay} />
            ))}
            <div className="flex justify-between items-baseline py-3">
              <div className="text-sm text-gray-500">
                A total of {total} transactions found
              </div>
              <PageControl
                pageNumber={pageNumber}
                pageSize={PAGE_SIZE}
                total={total}
              />
            </div>
          </>
        ) : (
          <PendingResults />
        )}
      </ContentFrame>
    </StandardFrame>
  );
};

export default React.memo(BlockTransactions);
