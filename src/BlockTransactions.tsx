import React, { useMemo, useContext } from "react";
import { useParams, useLocation } from "react-router";
import { ethers } from "ethers";
import queryString from "query-string";
import StandardFrame from "./StandardFrame";
import BlockTransactionHeader from "./block/BlockTransactionHeader";
import BlockTransactionResults from "./block/BlockTransactionResults";
import { PAGE_SIZE } from "./params";
import { RuntimeContext } from "./useRuntime";
import { useBlockTransactions } from "./useErigonHooks";

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

  const [totalTxs, txs] = useBlockTransactions(
    provider,
    blockNumber.toNumber()
  );

  const page = useMemo(() => {
    if (!txs) {
      return undefined;
    }
    const pageStart = (pageNumber - 1) * PAGE_SIZE;
    return txs.slice(pageStart, pageStart + PAGE_SIZE);
  }, [txs, pageNumber]);
  const total = totalTxs;

  document.title = `Block #${blockNumber} Txns | Otterscan`;

  return (
    <StandardFrame>
      <BlockTransactionHeader blockTag={blockNumber.toNumber()} />
      <BlockTransactionResults
        page={page}
        total={total ?? 0}
        pageNumber={pageNumber}
      />
    </StandardFrame>
  );
};

export default React.memo(BlockTransactions);
