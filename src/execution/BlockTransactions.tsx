import React, { useMemo, useContext } from "react";
import { useParams } from "react-router";
import { BigNumber } from "@ethersproject/bignumber";
import StandardFrame from "../components/StandardFrame";
import BlockTransactionHeader from "./block/BlockTransactionHeader";
import BlockTransactionResults from "./block/BlockTransactionResults";
import { PAGE_SIZE } from "../params";
import { RuntimeContext } from "../useRuntime";
import { useBlockTransactions } from "../useErigonHooks";
import { useSearchParams } from "react-router-dom";

const BlockTransactions: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams();

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const blockNumber = useMemo(
    () => BigNumber.from(params.blockNumber),
    [params.blockNumber]
  );

  const [totalTxs, txs] = useBlockTransactions(
    provider,
    blockNumber.toNumber(),
    pageNumber - 1,
    PAGE_SIZE
  );

  document.title = `Block #${blockNumber} Txns | Otterscan`;

  return (
    <StandardFrame>
      <BlockTransactionHeader blockTag={blockNumber.toNumber()} />
      <BlockTransactionResults
        page={txs}
        total={totalTxs ?? 0}
        pageNumber={pageNumber}
      />
    </StandardFrame>
  );
};

export default BlockTransactions;
