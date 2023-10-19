import React, { lazy, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlockLink from "../../components/BlockLink";
import BlockNotFound from "../../components/BlockNotFound";
import ContentFrame from "../../components/ContentFrame";
import StandardFrame from "../../components/StandardFrame";
import { PAGE_SIZE } from "../../params";
import { useBlockData, useBlockTransactions } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";

const Transaction = lazy(() => import("../Transaction"));

const BlockTransactionByIndex: React.FC = () => {
  const { blockNumberOrHash, txIndex } = useParams();
  const txIndexNum = Number(txIndex);
  const navigate = useNavigate();
  const { provider } = useContext(RuntimeContext);
  const { data: block, isLoading: isLoadingBlock } = useBlockData(
    provider,
    blockNumberOrHash,
  );
  let { data: blockTransactions } = useBlockTransactions(
    provider,
    block?.number,
    Math.floor(
      ((block ? block.transactionCount : txIndexNum) - 1 - txIndexNum) /
        PAGE_SIZE,
    ),
    PAGE_SIZE,
  );
  const invTxIndex = block ? block.transactionCount - 1 - txIndexNum : 0;
  useEffect(() => {
    if (
      block &&
      blockTransactions &&
      blockTransactions.txs[invTxIndex % PAGE_SIZE]
    ) {
      navigate("/tx/" + blockTransactions.txs[invTxIndex % PAGE_SIZE].hash, {
        replace: true,
      });
    }
  }, [blockTransactions, navigate]);

  return (
    <StandardFrame>
      {!block && !isLoadingBlock ? (
        <BlockNotFound blockNumberOrHash={blockNumberOrHash ?? ""} />
      ) : Number.isNaN(txIndexNum) ||
        (blockTransactions && txIndexNum >= blockTransactions.total) ? (
        <ContentFrame>
          <div className="py-4 text-sm">
            Block <BlockLink blockTag={blockNumberOrHash ?? ""} /> has no
            transaction at index {txIndexNum}.
          </div>
        </ContentFrame>
      ) : (
        <></>
      )}
    </StandardFrame>
  );
};

export default React.memo(BlockTransactionByIndex);
