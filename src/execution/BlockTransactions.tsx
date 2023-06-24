import React, { useContext } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import StandardFrame from "../components/StandardFrame";
import BlockTransactionHeader from "./block/BlockTransactionHeader";
import BlockTransactionResults from "./block/BlockTransactionResults";
import { PAGE_SIZE } from "../params";
import { useBlockTransactionsPageTitle } from "../useTitle";
import { RuntimeContext } from "../useRuntime";
import { useBlockTransactions } from "../useErigonHooks";

const BlockTransactions: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams();
  if (params.blockNumber === undefined) {
    throw new Error("blockNumber couldn't be undefined here");
  }
  const blockNumber = parseInt(params.blockNumber);

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const { data, isLoading } = useBlockTransactions(
    provider,
    blockNumber,
    pageNumber - 1,
    PAGE_SIZE
  );
  const txs = data?.txs;
  const totalTxs = data?.total;

  useBlockTransactionsPageTitle(
    blockNumber,
    pageNumber,
    totalTxs === undefined ? undefined : Math.ceil(totalTxs / PAGE_SIZE)
  );

  return (
    <StandardFrame>
      <BlockTransactionHeader blockTag={blockNumber} />
      <BlockTransactionResults
        page={txs}
        total={totalTxs ?? 0}
        pageNumber={pageNumber}
        isLoading={isLoading}
      />
    </StandardFrame>
  );
};

export default BlockTransactions;
